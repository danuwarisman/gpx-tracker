import React from 'react';

export default function Topbar({ fileName, triggerFileUpload }) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center">
          <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"><path d="M2 10 L5 5 L8 7 L11 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/><circle cx="11" cy="3" r="1.2" fill="white"/></svg>
        </div>
        <span className="text-xl font-medium text-slate-900 tracking-tight">GPX Tracker</span>
        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
        <span className="text-sm text-slate-600 truncate max-w-[200px]">{fileName}</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={triggerFileUpload} className="text-sm font-medium px-4 py-2 rounded-lg border border-green-600 bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 transition-colors">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v6M3 5l3 3 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
          Load GPX
        </button>
      </div>
    </div>
  );
}