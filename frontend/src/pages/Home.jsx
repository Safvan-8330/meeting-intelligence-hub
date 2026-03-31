import React from 'react';
import { MessageSquare } from 'lucide-react';
import UploadPortal from '../components/Upload/UploadPortal';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meeting Intelligence Hub</h1>
        <p className="text-gray-600 mt-2">Upload transcripts to extract decisions and analyze sentiment.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* The New Real Upload Component */}
        <div>
          <UploadPortal />
        </div>

        {/* Placeholder for Recent Meetings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-700">Recent Meetings</h2>
          </div>
          <div className="text-sm text-gray-500 italic p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
            No meetings analyzed yet. Upload a transcript to get started.
          </div>
        </div>
      </div>
    </div>
  );
}