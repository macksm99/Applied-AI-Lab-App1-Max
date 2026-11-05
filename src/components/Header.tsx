import React from 'react';
import { BarChart3, Database, FileSpreadsheet, Sparkles, UploadCloud } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLoadSample: () => void;
  onUploadClick: () => void;
  hasData: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onLoadSample,
  onUploadClick,
  hasData,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <BarChart3 className="w-4 h-4" />
            </div>
            <a
              href="#overview"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('overview');
              }}
              className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap"
            >
              Veloce Sales Analytics
            </a>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('overview')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Overview & AI
            </button>
            <button
              onClick={() => setActiveTab('chart')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'chart'
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Revenue Chart
            </button>
            <button
              onClick={() => setActiveTab('pivot')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'pivot'
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Pivot Table
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'orders'
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Orders Dataset
            </button>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onUploadClick}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Upload CSV
            </button>
            <button
              onClick={onLoadSample}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm rounded-lg transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Sample Data
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
