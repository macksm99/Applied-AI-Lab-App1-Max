import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Download, Sparkles, RefreshCw } from 'lucide-react';
import { generateSampleCsvString } from '../utils/sampleData.ts';

interface CsvUploaderProps {
  onFileLoaded: (csvContent: string, fileName: string) => void;
  onLoadSample: () => void;
  isLoadingSample?: boolean;
  totalOrders: number;
  fileName?: string;
  parsingErrors: string[];
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({
  onFileLoaded,
  onLoadSample,
  isLoadingSample,
  totalOrders,
  fileName,
  parsingErrors,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onFileLoaded(content, file.name);
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csv = generateSampleCsvString();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sales_orders_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Upload Sales Orders CSV</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingest orders with columns: <span className="font-mono text-slate-700">quarter, region, channel, product, units, discount_pct, revenue</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Download Sample CSV
          </button>
          <button
            onClick={onLoadSample}
            disabled={isLoadingSample}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-colors whitespace-nowrap"
          >
            {isLoadingSample ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Load 120+ Sample Orders
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`lg:col-span-8 cursor-pointer border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,text/csv"
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <span className="text-sm font-semibold text-slate-900">
            Click to upload or drag & drop CSV
          </span>
          <span className="text-xs text-slate-500 mt-1 max-w-sm">
            Standard CSV format. Automatically parses currency symbols, percentage characters, and header variations.
          </span>
        </div>

        {/* Status & Required Schema Card */}
        <div className="lg:col-span-4 bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-700 tracking-wider uppercase mb-2">
              Ingestion Status
            </div>

            {totalOrders > 0 ? (
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 truncate max-w-[220px]">
                    {fileName || 'Dataset Loaded'}
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    {totalOrders.toLocaleString()} verified orders active
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500">
                No CSV uploaded yet. Upload a file or click <span className="font-medium text-indigo-600">Load 120+ Sample Orders</span> to explore immediately.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/70">
            <div className="text-[11px] font-medium text-slate-500 mb-1.5">
              Required Schema Columns:
            </div>
            <div className="flex flex-wrap gap-1">
              {['quarter', 'region', 'channel', 'product', 'units', 'discount_pct', 'revenue'].map((col) => (
                <span
                  key={col}
                  className="font-mono text-[10px] bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Parsing Errors Banner */}
      {parsingErrors.length > 0 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-medium">Notice during parsing:</div>
            <ul className="list-disc list-inside space-y-0.5 text-amber-800">
              {parsingErrors.slice(0, 3).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
              {parsingErrors.length > 3 && (
                <li>...and {parsingErrors.length - 3} more minor notices</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
};
