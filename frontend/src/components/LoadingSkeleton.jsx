import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse p-4">
      <div className="h-8 bg-slate-200 rounded-lg w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="h-24 bg-slate-200 rounded-xl"></div>
        <div className="h-24 bg-slate-200 rounded-xl"></div>
        <div className="h-24 bg-slate-200 rounded-xl"></div>
        <div className="h-24 bg-slate-200 rounded-xl"></div>
      </div>
      <div className="h-64 bg-slate-200 rounded-xl"></div>
    </div>
  );
}
