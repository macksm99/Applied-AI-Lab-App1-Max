import React, { useState } from 'react';
import { Sparkles, Copy, Check, ChevronDown, ChevronUp, RefreshCw, Calculator, ShieldCheck } from 'lucide-react';
import { AggregatedStats, AiSummaryResponse } from '../types.ts';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/analytics.ts';

interface AiSummaryCardProps {
  stats: AggregatedStats;
  aiData: AiSummaryResponse | null;
  isLoading: boolean;
  onRegenerate: () => void;
  error?: string | null;
}

export const AiSummaryCard: React.FC<AiSummaryCardProps> = ({
  stats,
  aiData,
  isLoading,
  onRegenerate,
  error,
}) => {
  const [copied, setCopied] = useState(false);
  const [showLedger, setShowLedger] = useState(false);

  const { q2q3Analysis } = stats;
  const mostChanged = q2q3Analysis.mostChangedByAbsolute;

  const handleCopy = () => {
    if (aiData?.summary) {
      navigator.clipboard.writeText(aiData.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs relative overflow-hidden">
      {/* Decorative subtle top edge accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900">
                Executive Q2 to Q3 Regional Shift Summary
              </h2>
              <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {aiData?.modelUsed || 'AI Engine'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Three-sentence executive brief generated using strictly verified numbers calculated by the application
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {aiData?.summary && (
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              {copied ? 'Copied' : 'Copy Summary'}
            </button>
          )}
          <button
            onClick={onRegenerate}
            disabled={isLoading || !q2q3Analysis.hasBothQuarters}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Analyzing...' : 'Regenerate'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-5">
        {!q2q3Analysis.hasBothQuarters ? (
          <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 text-center">
            <Calculator className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">Q2 and Q3 Data Required</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              The uploaded dataset must include sales orders for both <span className="font-semibold text-slate-700">Q2</span> and <span className="font-semibold text-slate-700">Q3</span> to compute regional delta shifts.
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-3 py-4 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-11/12"></div>
            <div className="h-4 bg-slate-200 rounded w-4/5"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
            {error}
          </div>
        ) : (
          <div className="space-y-3">
            {/* The 3-Sentence Executive Summary */}
            <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-lg">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm leading-relaxed text-slate-800">
                  {aiData?.sentences && aiData.sentences.length > 0 ? (
                    aiData.sentences.map((sentence, idx) => (
                      <p key={idx} className="flex gap-2">
                        <span className="font-mono text-xs font-semibold text-indigo-600 shrink-0 mt-0.5">
                          0{idx + 1}.
                        </span>
                        <span>{sentence}</span>
                      </p>
                    ))
                  ) : (
                    <p>{aiData?.summary}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Accordion Button */}
            <div className="pt-2">
              <button
                onClick={() => setShowLedger(!showLedger)}
                className="w-full flex items-center justify-between text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-lg transition-colors border border-slate-200/80"
              >
                <span className="flex items-center gap-2">
                  <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Inspect Verified App-Calculated Numbers Used by the AI</span>
                </span>
                {showLedger ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {/* Verified Mathematical Ledger Drawer */}
              {showLedger && mostChanged && (
                <div className="mt-3 p-4 bg-white border border-slate-200 rounded-lg space-y-4 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                      <div className="text-[11px] text-slate-500 font-medium">Most Changed Region</div>
                      <div className="font-bold text-slate-900 mt-0.5">{mostChanged.region}</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                      <div className="text-[11px] text-slate-500 font-medium">Q2 Revenue</div>
                      <div className="font-mono font-bold text-slate-900 mt-0.5">{formatCurrency(mostChanged.q2Revenue)}</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                      <div className="text-[11px] text-slate-500 font-medium">Q3 Revenue</div>
                      <div className="font-mono font-bold text-slate-900 mt-0.5">{formatCurrency(mostChanged.q3Revenue)}</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                      <div className="text-[11px] text-slate-500 font-medium">Absolute Shift ($)</div>
                      <div className={`font-mono font-bold mt-0.5 ${mostChanged.absoluteChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {mostChanged.absoluteChange >= 0 ? '+' : ''}{formatCurrency(mostChanged.absoluteChange)} ({formatPercentage(mostChanged.percentageChange)})
                      </div>
                    </div>
                  </div>

                  {/* Drivers Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {mostChanged.topProductDriver && (
                      <div className="p-3 bg-slate-50/70 rounded border border-slate-100">
                        <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                          Primary Product Driver
                        </div>
                        <div className="flex items-center justify-between text-slate-800">
                          <span className="font-medium">{mostChanged.topProductDriver.product}</span>
                          <span className="font-mono font-semibold">
                            {mostChanged.topProductDriver.change >= 0 ? '+' : ''}
                            {formatCurrency(mostChanged.topProductDriver.change)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex justify-between font-mono">
                          <span>Q2: {formatCurrency(mostChanged.topProductDriver.q2Revenue)}</span>
                          <span>Q3: {formatCurrency(mostChanged.topProductDriver.q3Revenue)}</span>
                        </div>
                      </div>
                    )}

                    {mostChanged.topChannelDriver && (
                      <div className="p-3 bg-slate-50/70 rounded border border-slate-100">
                        <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                          Primary Channel Driver
                        </div>
                        <div className="flex items-center justify-between text-slate-800">
                          <span className="font-medium">{mostChanged.topChannelDriver.channel}</span>
                          <span className="font-mono font-semibold">
                            {mostChanged.topChannelDriver.change >= 0 ? '+' : ''}
                            {formatCurrency(mostChanged.topChannelDriver.change)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex justify-between font-mono">
                          <span>Q2: {formatCurrency(mostChanged.topChannelDriver.q2Revenue)}</span>
                          <span>Q3: {formatCurrency(mostChanged.topChannelDriver.q3Revenue)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Volume and Regional Context */}
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-1 font-mono">
                    <span>Units: {formatNumber(mostChanged.q2Units)} → {formatNumber(mostChanged.q3Units)} ({mostChanged.unitsChange >= 0 ? '+' : ''}{formatNumber(mostChanged.unitsChange)})</span>
                    <span>Avg Discount: {mostChanged.q2AvgDiscount}% → {mostChanged.q3AvgDiscount}% ({mostChanged.discountChange >= 0 ? '+' : ''}{mostChanged.discountChange} pp)</span>
                    <span>Total Company Q2→Q3: {q2q3Analysis.totalChange >= 0 ? '+' : ''}{formatCurrency(q2q3Analysis.totalChange)} ({formatPercentage(q2q3Analysis.totalPctChange)})</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
