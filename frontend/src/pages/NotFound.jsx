import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <FileQuestion className="w-16 h-16 text-indigo-400 mb-4 animate-bounce" />
      <h1 className="text-2xl font-bold text-slate-800">404 — Page Not Found</h1>
      <p className="text-xs text-slate-500 mt-1 mb-6 max-w-sm">
        The workflow resource or page route you requested does not exist or has been moved.
      </p>
      <Link to="/dashboard" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md">
        Return to Dashboard
      </Link>
    </div>
  );
}
