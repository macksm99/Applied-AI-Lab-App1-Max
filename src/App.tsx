import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/Header.tsx';
import { CsvUploader } from './components/CsvUploader.tsx';
import { AiSummaryCard } from './components/AiSummaryCard.tsx';
import { RevenueChart } from './components/RevenueChart.tsx';
import { PivotTable } from './components/PivotTable.tsx';
import { RawOrdersTable } from './components/RawOrdersTable.tsx';
import { SalesOrder, AiSummaryResponse } from './types.ts';
import { SAMPLE_SALES_ORDERS } from './utils/sampleData.ts';
import { parseCSV } from './utils/csv.ts';
import {
  computeAggregatedStats,
  formatCurrency,
  formatNumber,
  formatPercentage,
  generateDeterministicThreeSentenceSummary,
} from './utils/analytics.ts';
import { DollarSign, TrendingUp, TrendingDown, Layers, MapPin, X } from 'lucide-react';

export default function App() {
  const [orders, setOrders] = useState<SalesOrder[]>(SAMPLE_SALES_ORDERS);
  const [fileName, setFileName] = useState<string>('sample_sales_orders_q1_q4.csv');
  const [parsingErrors, setParsingErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [isLoadingSample, setIsLoadingSample] = useState<boolean>(false);

  // AI Summary State
  const [aiData, setAiData] = useState<AiSummaryResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Ref to trigger file upload
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  // Calculate aggregated stats across quarters, regions, channels, products
  const stats = useMemo(() => computeAggregatedStats(orders), [orders]);

  // Request AI summary from server
  const fetchAiSummary = async () => {
    if (!stats.q2q3Analysis.hasBothQuarters || !stats.q2q3Analysis.mostChangedByAbsolute) {
      setAiData(null);
      return;
    }

    setIsAiLoading(true);
    setAiError(null);

    // Prepare mathematically verified fallback summary based strictly on calculated numbers
    const fallback = generateDeterministicThreeSentenceSummary(stats.q2q3Analysis);

    try {
      const response = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q2q3Analysis: stats.q2q3Analysis,
          fallbackSummary: fallback.summary,
          fallbackSentences: fallback.sentences,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: AiSummaryResponse = await response.json();
      setAiData(data);
    } catch (err: any) {
      console.warn('Using client-side calculated summary fallback:', err);
      // Fallback guarantees that the user always sees the exact three-sentence summary using only app-calculated numbers
      setAiData({
        summary: fallback.summary,
        sentences: fallback.sentences,
        modelUsed: 'deterministic-verified-engine',
        calculatedContext: {
          mostChangedRegion: stats.q2q3Analysis.mostChangedByAbsolute.region,
          changeType: 'absolute',
          q2Revenue: stats.q2q3Analysis.mostChangedByAbsolute.q2Revenue,
          q3Revenue: stats.q2q3Analysis.mostChangedByAbsolute.q3Revenue,
          absoluteChange: stats.q2q3Analysis.mostChangedByAbsolute.absoluteChange,
          percentageChange: stats.q2q3Analysis.mostChangedByAbsolute.percentageChange,
          keyDriverDescription: 'Calculated metrics',
        },
        generatedAt: new Date().toISOString(),
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Generate AI summary when stats change (e.g. new CSV loaded)
  useEffect(() => {
    fetchAiSummary();
  }, [stats.grandTotalRevenue, stats.q2q3Analysis.hasBothQuarters]);

  // Handle CSV file upload
  const handleFileLoaded = (csvContent: string, loadedFileName: string) => {
    const result = parseCSV(csvContent);
    if (result.orders.length > 0) {
      setOrders(result.orders);
      setFileName(loadedFileName);
      setParsingErrors(result.errors);
      setShowUploadModal(false);
    } else {
      setParsingErrors(result.errors);
    }
  };

  // Handle loading sample data
  const handleLoadSample = () => {
    setIsLoadingSample(true);
    setTimeout(() => {
      setOrders(SAMPLE_SALES_ORDERS);
      setFileName('sample_sales_orders_q1_q4.csv');
      setParsingErrors([]);
      setIsLoadingSample(false);
      setShowUploadModal(false);
    }, 200);
  };

  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const { q2q3Analysis } = stats;

  return (
    <div className="min-h-screen bg-sky-100 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLoadSample={handleLoadSample}
        onUploadClick={handleUploadClick}
        hasData={orders.length > 0}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Metric Summary Ribbon */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Grand Total Revenue</span>
              <DollarSign className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1.5">
              {formatCurrency(stats.grandTotalRevenue)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {formatNumber(stats.grandTotalUnits)} units across {stats.totalOrders} orders
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Q2 → Q3 Delta</span>
              {q2q3Analysis.totalChange >= 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-600" />
              )}
            </div>
            <div
              className={`text-xl font-bold font-mono tabular-nums mt-1.5 ${
                q2q3Analysis.totalChange >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {q2q3Analysis.hasBothQuarters
                ? `${q2q3Analysis.totalChange >= 0 ? '+' : ''}${formatCurrency(q2q3Analysis.totalChange)}`
                : '—'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              {q2q3Analysis.hasBothQuarters
                ? `${formatPercentage(q2q3Analysis.totalPctChange)} company shift`
                : 'Requires Q2 & Q3'}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Largest Q2-Q3 Regional Shift</span>
              <MapPin className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1.5 truncate">
              {q2q3Analysis.mostChangedByAbsolute?.region || '—'}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">
              {q2q3Analysis.mostChangedByAbsolute
                ? `${q2q3Analysis.mostChangedByAbsolute.absoluteChange >= 0 ? '+' : ''}${formatCurrency(
                    q2q3Analysis.mostChangedByAbsolute.absoluteChange
                  )} (${formatPercentage(q2q3Analysis.mostChangedByAbsolute.percentageChange)})`
                : 'No delta available'}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Dataset Scope</span>
              <Layers className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1.5">
              {stats.quarters.length} Quarters · {stats.regions.length} Regions
            </div>
            <div className="text-[11px] text-slate-500 mt-1 truncate">
              {stats.quarters.join(', ')} ({stats.regions.join(', ')})
            </div>
          </div>
        </section>

        {/* Upload Drawer / In-page Uploader */}
        <div ref={uploadSectionRef}>
          <CsvUploader
            onFileLoaded={handleFileLoaded}
            onLoadSample={handleLoadSample}
            isLoadingSample={isLoadingSample}
            totalOrders={orders.length}
            fileName={fileName}
            parsingErrors={parsingErrors}
          />
        </div>

        {/* View Tabs Switching */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* The 3-Sentence AI Summary Card */}
            <AiSummaryCard
              stats={stats}
              aiData={aiData}
              isLoading={isAiLoading}
              onRegenerate={fetchAiSummary}
              error={aiError}
            />

            {/* Total Revenue by Region and Quarter Chart */}
            <RevenueChart stats={stats} />

            {/* Total Revenue by Region and Quarter Pivot Table */}
            <PivotTable stats={stats} />

            {/* Raw Orders Table */}
            <RawOrdersTable
              orders={orders}
              quarters={stats.quarters}
              regions={stats.regions}
            />
          </div>
        )}

        {activeTab === 'chart' && (
          <div className="space-y-8">
            <RevenueChart stats={stats} />
            <AiSummaryCard
              stats={stats}
              aiData={aiData}
              isLoading={isAiLoading}
              onRegenerate={fetchAiSummary}
              error={aiError}
            />
          </div>
        )}

        {activeTab === 'pivot' && (
          <div className="space-y-8">
            <PivotTable stats={stats} />
            <AiSummaryCard
              stats={stats}
              aiData={aiData}
              isLoading={isAiLoading}
              onRegenerate={fetchAiSummary}
              error={aiError}
            />
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-8">
            <RawOrdersTable
              orders={orders}
              quarters={stats.quarters}
              regions={stats.regions}
            />
          </div>
        )}
      </main>

      {/* Upload Modal (Triggered by Header "Upload CSV" button) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 relative">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Upload Sales Orders CSV
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select or drop your sales order CSV file with columns: quarter, region, channel, product, units, discount_pct, revenue.
            </p>
            <CsvUploader
              onFileLoaded={handleFileLoaded}
              onLoadSample={handleLoadSample}
              isLoadingSample={isLoadingSample}
              totalOrders={orders.length}
              fileName={fileName}
              parsingErrors={parsingErrors}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Veloce Sales Analytics</span>
            <span>·</span>
            <span>Verified Q2 to Q3 Financial Shift Analysis</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Powered by strictly verified app-calculated numbers
          </div>
        </div>
      </footer>
    </div>
  );
}
