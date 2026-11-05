import React, { useState } from 'react';
import { AggregatedStats } from '../types.ts';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/analytics.ts';
import { exportToCSV } from '../utils/csv.ts';
import { Download, Table, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';

interface PivotTableProps {
  stats: AggregatedStats;
}

export const PivotTable: React.FC<PivotTableProps> = ({ stats }) => {
  const [metricMode, setMetricMode] = useState<'revenue' | 'units' | 'discount'>('revenue');

  const {
    quarters,
    regions,
    revenueMatrix,
    unitsMatrix,
    avgDiscountMatrix,
    quarterTotals,
    regionTotals,
    grandTotalRevenue,
    grandTotalUnits,
    q2q3Analysis,
  } = stats;

  const handleExport = () => {
    const headers = ['Region', ...quarters, 'Total Revenue'];
    if (q2q3Analysis.hasBothQuarters) {
      headers.push('Q2 to Q3 Change ($)', 'Q2 to Q3 Change (%)');
    }

    const rows = regions.map((r) => {
      const row: (string | number)[] = [r];
      quarters.forEach((q) => {
        row.push(revenueMatrix[r]?.[q] || 0);
      });
      row.push(regionTotals[r] || 0);

      if (q2q3Analysis.hasBothQuarters) {
        const q2 = revenueMatrix[r]?.['Q2'] || 0;
        const q3 = revenueMatrix[r]?.['Q3'] || 0;
        const delta = q3 - q2;
        const pct = q2 > 0 ? ((q3 - q2) / q2) * 100 : 0;
        row.push(delta);
        row.push(`${pct.toFixed(1)}%`);
      }
      return row;
    });

    // Add totals row
    const totalsRow: (string | number)[] = ['Total'];
    quarters.forEach((q) => {
      totalsRow.push(quarterTotals[q] || 0);
    });
    totalsRow.push(grandTotalRevenue);
    if (q2q3Analysis.hasBothQuarters) {
      totalsRow.push(q2q3Analysis.totalChange);
      totalsRow.push(`${q2q3Analysis.totalPctChange}%`);
    }
    rows.push(totalsRow);

    exportToCSV('sales_revenue_by_region_and_quarter.csv', rows, headers);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">
              Cross-Tabulation: Revenue by Region & Quarter
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Regional performance breakdown with Q2 to Q3 delta calculations
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Metric Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setMetricMode('revenue')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                metricMode === 'revenue'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Revenue ($)
            </button>
            <button
              onClick={() => setMetricMode('units')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                metricMode === 'units'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Units
            </button>
            <button
              onClick={() => setMetricMode('discount')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                metricMode === 'discount'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Avg Discount
            </button>
          </div>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
              <th className="py-3 px-4 w-44">Region</th>
              {quarters.map((q) => (
                <th
                  key={q}
                  className={`py-3 px-4 text-right font-mono ${
                    q === 'Q2' || q === 'Q3'
                      ? 'bg-indigo-50/50 text-indigo-950 font-bold'
                      : ''
                  }`}
                >
                  {q}
                </th>
              ))}
              <th className="py-3 px-4 text-right font-mono bg-slate-100/70 text-slate-900">
                Total
              </th>
              {q2q3Analysis.hasBothQuarters && (
                <>
                  <th className="py-3 px-4 text-right font-mono bg-indigo-50/70 text-indigo-900 font-bold border-l border-slate-200">
                    Q2→Q3 Shift ($)
                  </th>
                  <th className="py-3 px-4 text-right font-mono bg-indigo-50/70 text-indigo-900 font-bold">
                    Q2→Q3 Shift (%)
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {regions.map((region) => {
              const q2Rev = revenueMatrix[region]?.['Q2'] || 0;
              const q3Rev = revenueMatrix[region]?.['Q3'] || 0;
              const delta = q3Rev - q2Rev;
              const pct = q2Rev > 0 ? ((q3Rev - q2Rev) / q2Rev) * 100 : 0;
              const isMaxDelta = q2q3Analysis.mostChangedByAbsolute?.region === region;

              return (
                <tr
                  key={region}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isMaxDelta ? 'bg-amber-50/20' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    <span>{region}</span>
                    {isMaxDelta && (
                      <span className="text-[10px] font-medium text-amber-700 bg-amber-100/70 px-1.5 py-0.2 rounded font-sans">
                        Largest Q2-Q3 Shift
                      </span>
                    )}
                  </td>

                  {quarters.map((q) => {
                    let cellContent = '';
                    if (metricMode === 'revenue') {
                      cellContent = formatCurrency(revenueMatrix[region]?.[q] || 0);
                    } else if (metricMode === 'units') {
                      cellContent = formatNumber(unitsMatrix[region]?.[q] || 0);
                    } else {
                      cellContent = `${((avgDiscountMatrix[region]?.[q] || 0) * 100).toFixed(1)}%`;
                    }

                    return (
                      <td
                        key={q}
                        className={`py-3 px-4 text-right font-mono tabular-nums ${
                          q === 'Q2' || q === 'Q3' ? 'bg-indigo-50/20 font-medium' : ''
                        }`}
                      >
                        {cellContent}
                      </td>
                    );
                  })}

                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 bg-slate-50/40 tabular-nums">
                    {metricMode === 'revenue'
                      ? formatCurrency(regionTotals[region] || 0)
                      : metricMode === 'units'
                      ? formatNumber(
                          quarters.reduce((sum, q) => sum + (unitsMatrix[region]?.[q] || 0), 0)
                        )
                      : '—'}
                  </td>

                  {q2q3Analysis.hasBothQuarters && (
                    <>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums border-l border-slate-200">
                        <span
                          className={`inline-flex items-center gap-1 ${
                            delta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {delta >= 0 ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5" />
                          )}
                          {delta >= 0 ? '+' : ''}
                          {formatCurrency(delta)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                        <span
                          className={delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}
                        >
                          {formatPercentage(pct)}
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>

          {/* Grand Totals Footer */}
          <tfoot>
            <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
              <td className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[11px] text-slate-700">
                Total Across All Regions
              </td>
              {quarters.map((q) => {
                let cellTotal = '';
                if (metricMode === 'revenue') {
                  cellTotal = formatCurrency(quarterTotals[q] || 0);
                } else if (metricMode === 'units') {
                  const uTotal = regions.reduce((sum, r) => sum + (unitsMatrix[r]?.[q] || 0), 0);
                  cellTotal = formatNumber(uTotal);
                } else {
                  cellTotal = '—';
                }

                return (
                  <td
                    key={q}
                    className={`py-3.5 px-4 text-right font-mono tabular-nums ${
                      q === 'Q2' || q === 'Q3' ? 'bg-indigo-100/50' : ''
                    }`}
                  >
                    {cellTotal}
                  </td>
                );
              })}

              <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-900 bg-slate-200/60 tabular-nums">
                {metricMode === 'revenue'
                  ? formatCurrency(grandTotalRevenue)
                  : metricMode === 'units'
                  ? formatNumber(grandTotalUnits)
                  : '—'}
              </td>

              {q2q3Analysis.hasBothQuarters && (
                <>
                  <td className="py-3.5 px-4 text-right font-mono font-extrabold tabular-nums border-l border-slate-300">
                    <span
                      className={
                        q2q3Analysis.totalChange >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }
                    >
                      {q2q3Analysis.totalChange >= 0 ? '+' : ''}
                      {formatCurrency(q2q3Analysis.totalChange)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-extrabold tabular-nums">
                    <span
                      className={
                        q2q3Analysis.totalChange >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }
                    >
                      {formatPercentage(q2q3Analysis.totalPctChange)}
                    </span>
                  </td>
                </>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
