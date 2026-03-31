import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Calendar, User, FileText } from 'lucide-react';

export default function MeetingDetail() {
  const { filename } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the analysis from our FastAPI backend
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/analysis/${filename}`);
        if (!response.ok) {
          throw new Error('Analysis not found. Did you upload this file yet?');
        }
        const result = await response.json();
        setData(result.analysis);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [filename]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Analyzing transcript...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100 max-w-md w-full text-center">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <Link to="/" className="text-blue-600 hover:underline flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg mr-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{filename}</h1>
              <p className="text-sm text-gray-500">Analysis complete • Extracted Decisions & Action Items</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Key Decisions Column */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
              Key Decisions
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
              {data.decisions.map((decision, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-2 h-2 mt-2 rounded-full bg-green-500 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-700 text-sm leading-relaxed">{decision}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items Table Column */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Action Items</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                    <th className="p-4">Assignee</th>
                    <th className="p-4">Task Description</th>
                    <th className="p-4">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.action_items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center font-medium text-gray-900">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          {item.who}
                        </div>
                      </td>
                      <td className="p-4 text-gray-700 text-sm">{item.what}</td>
                      <td className="p-4">
                        <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          <Calendar className="w-3 h-3 mr-1.5" />
                          {item.by_when}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}