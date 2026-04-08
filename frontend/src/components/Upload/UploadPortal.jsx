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
      setError("Unsupported format. Please upload .txt or .vtt only.");
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed. Is the server running?');

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
    // Dark Mode Card
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
      <h2 className="text-xl font-bold text-white mb-6">Ingest Transcripts</h2>
      
      {/* Dark Dropzone */}
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300
          ${isDragActive 
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02] shadow-[0_0_20px_rgba(99,102,241,0.1)]' 
            : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'}`}
      >
        <input {...getInputProps()} />
        <div className={`p-4 rounded-xl mb-4 transition-colors ${isDragActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
          <UploadCloud className="w-8 h-8" />
        </div>
        <p className="text-base font-semibold text-slate-200">
          {isDragActive ? "Drop transcripts here..." : "Click or drag files to upload"}
        </p>
        <p className="text-sm text-slate-500 mt-2">Supports .txt and .vtt formats</p>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center text-sm font-medium">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          {error}
        </div>
      )}

      {uploadSuccess && lastProcessedFile && (
        <div className="mt-6 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center text-emerald-400 text-sm font-semibold mb-3 sm:mb-0">
            <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
            Analysis successfully processed
          </div>
          <Link 
            to={`/meeting/${lastProcessedFile}`}
            className="px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold rounded-xl hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm"
          >
            View Dashboard →
          </Link>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Queue</h3>
          <div className="space-y-3">
            {uploadedFiles.map((file, index) => (
              <div key={file.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700 group">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-slate-800 rounded-lg text-indigo-400 border border-slate-700">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{file.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{file.size} • {file.date}</p>
                  </div>
                </div>
                <button onClick={() => removeFile(file.id, index)} className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <button 
            onClick={handleProcessTranscripts}
            disabled={isUploading}
            className={`mt-6 w-full text-white font-semibold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center
              ${isUploading ? 'bg-slate-700 cursor-not-allowed text-slate-400' : 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]'}`}
          >
            {isUploading ? (
              <span className="flex items-center">
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </span>
            ) : (
              `Process ${uploadedFiles.length} Transcript${uploadedFiles.length > 1 ? 's' : ''}`
            )}
          </button>
        </div>
      )}
    </div>
  );
}