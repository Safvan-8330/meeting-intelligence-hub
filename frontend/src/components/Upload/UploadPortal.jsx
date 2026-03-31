import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UploadPortal() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [actualFiles, setActualFiles] = useState([]);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [lastProcessedFile, setLastProcessedFile] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setError("Unsupported file format. Please upload .txt or .vtt files only.");
      setTimeout(() => setError(null), 5000);
    }

    setActualFiles(prev => [...prev, ...acceptedFiles]);

    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      date: new Date().toLocaleDateString(),
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setUploadSuccess(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/vtt': ['.vtt']
    }
  });

  const removeFile = (id, index) => {
    setUploadedFiles(files => files.filter(f => f.id !== id));
    setActualFiles(files => files.filter((_, i) => i !== index));
  };

  const handleProcessTranscripts = async () => {
    if (actualFiles.length === 0) return;
    
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    actualFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('http://localhost:8000/api/upload/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed. Is the Python server running?');
      }

      if (uploadedFiles.length > 0) {
        setLastProcessedFile(uploadedFiles[0].name);
      }
      
      setUploadSuccess(true);
      setUploadedFiles([]); 
      setActualFiles([]);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Upload Transcripts</h2>
      
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
      >
        <input {...getInputProps()} />
        <UploadCloud className={`w-12 h-12 mb-4 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
        <p className="text-sm font-medium text-gray-700">
          {isDragActive ? "Drop transcripts here..." : "Drag & drop transcripts here, or click to browse"}
        </p>
        <p className="text-xs text-gray-500 mt-2">Supports .txt and .vtt files</p>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center text-sm">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {uploadSuccess && lastProcessedFile && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center text-green-700 text-sm font-medium mb-3 sm:mb-0">
            <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0 text-green-500" />
            Transcripts successfully uploaded and processed!
          </div>
          <Link 
            to={`/meeting/${lastProcessedFile}`}
            className="px-4 py-2 bg-white border border-green-300 text-green-700 text-sm font-medium rounded-lg hover:bg-green-50 transition-colors shadow-sm"
          >
            View Analysis
          </Link>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Ready for Analysis</h3>
          <div className="space-y-3">
            {uploadedFiles.map((file, index) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.size} • {file.date}</p>
                  </div>
                </div>
                <button onClick={() => removeFile(file.id, index)} className="text-gray-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <button 
            onClick={handleProcessTranscripts}
            disabled={isUploading}
            className={`mt-4 w-full text-white font-medium py-2 px-4 rounded-lg transition-colors 
              ${isUploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isUploading ? 'Uploading to Server...' : `Process ${uploadedFiles.length} Transcript${uploadedFiles.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
}