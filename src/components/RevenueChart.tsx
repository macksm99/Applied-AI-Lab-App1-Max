import React, { useState } from 'react';
import { AggregatedStats } from '../types.ts';
import { formatCurrency, formatNumber } from '../utils/analytics.ts';
import { BarChart, Layers, ArrowRightLeft } from 'lucide-react';

interface RevenueChartProps {
  stats: AggregatedStats;
}

const REGION_COLORS = [
  '#4F46E5', // Indigo
  '#0284C7', // Sky
  '#059669', // Emerald
  '#D97706', // Amber
  '#8B5CF6', // Purple
  '#E11D48', // Rose
  '#0D9488', // Teal
  '#475569', // Slate
];

export const RevenueChart: React.FC<RevenueChartProps> = ({ stats }) => {
  const [viewMode, setViewMode] = useState<'byQuarter' | 'byRegion' | 'q2q3Delta'>('byQuarter');
  const [hoveredBar, setHoveredBar] = useState<{
    quarter: string;
    region: string;
    revenue: number;
    units: number;
    x: number;
    y: number;
  } | null>(null);

  const { quarters, regions, revenueMatrix, unitsMatrix, quarterTotals, q2q3Analysis } = stats;

  if (quarters.length === 0 || regions.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
        No sales data available to render chart.
      </div>
    );
  }

  // Assign consistent colors to regions
  const regionColorMap: Record<string, string> = {};
  regions.forEach((r, idx) => {
    regionColorMap[r] = REGION_COLORS[idx % REGION_COLORS.length];
  });

  // Calculate chart bounds
  const svgWidth = 850;
  const svgHeight = 360;
  const padding = { top: 30, right: 30, bottom: 60, left: 80 };
  const innerWidth = svgWidth - padding.left - padding.right;
  const innerHeight = svgHeight - padding.top - padding.bottom;

  // Find max revenue for scaling
  let maxRevenue = 0;
  if (viewMode === 'q2q3Delta') {
    regions.forEach((r) => {
      const q2 = revenueMatrix[r]?.['Q2'] || 0;
      const q3 = revenueMatrix[r]?.['Q3'] || 0;
      maxRevenue = Math.max(maxRevenue, q2, q3);
    });
  } else {
    regions.forEach((r) => {
      quarters.forEach((q) => {
        const val = revenueMatrix[r]?.[q] || 0;
        if (val > maxRevenue) maxRevenue = val;
      });
    });
  }
  // Ensure a nice round top bound
  const yAxisMax = Math.ceil((maxRevenue * 1.15) / 100000) * 100000 || 100000;
  const yTicks = [0, yAxisMax * 0.25, yAxisMax * 0.5, yAxisMax * 0.75, yAxisMax];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Total Revenue by Region and Quarter
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quarterly revenue distributions and comparative regional volume
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setViewMode('byQuarter')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'byQuarter'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Grouped by Quarter
          </button>
          <button
            onClick={() => setViewMode('byRegion')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'byRegion'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Grouped by Region
          </button>
          {q2q3Analysis.hasBothQuarters && (
            <button
              onClick={() => setViewMode('q2q3Delta')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                viewMode === 'q2q3Delta'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Q2 vs Q3 Focus
            </button>
          )}
        </div>
      </div>

      {/* Region Legend */}
      <div className="flex flex-wrap items-center gap-4 py-3 border-b border-slate-50 text-xs text-slate-600">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Regions:
        </span>
        {regions.map((region) => (
          <div key={region} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-xs shrink-0"
              style={{ backgroundColor: regionColorMap[region] }}
            />
            <span className="font-medium text-slate-700">{region}</span>
          </div>
        ))}
      </div>

      {/* SVG Chart Container */}
      <div className="mt-4 relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[650px] overflow-visible"
        >
          {/* Y-Axis Horizontal Gridlines and Labels */}
          {yTicks.map((tickVal) => {
            const y = padding.top + innerHeight - (tickVal / yAxisMax) * innerHeight;
            return (
              <g key={tickVal}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + innerWidth}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="font-mono text-[11px] fill-slate-400 tabular-nums"
                >
                  {tickVal >= 1000000
                    ? `$${(tickVal / 1000000).toFixed(1)}M`
                    : tickVal >= 1000
                    ? `$${Math.round(tickVal / 1000)}K`
                    : `$${tickVal}`}
                </text>
              </g>
            );
          })}

          {/* MODE 1: Grouped by Quarter (X-axis = Quarters, Bars = Regions) */}
          {viewMode === 'byQuarter' &&
            quarters.map((quarter, qIdx) => {
              const groupWidth = innerWidth / quarters.length;
              const groupX = padding.left + qIdx * groupWidth;
              const barMargin = 6;
              const availableWidth = groupWidth - barMargin * 2;
              const barWidth = Math.min(32, availableWidth / regions.length);
              const startOffset = groupX + (groupWidth - barWidth * regions.length) / 2;

              return (
                <g key={quarter}>
                  {/* Subtle vertical zebra highlight for Q2 / Q3 */}
                  {(quarter === 'Q2' || quarter === 'Q3') && (
                    <rect
                      x={groupX + 4}
                      y={padding.top}
                      width={groupWidth - 8}
                      height={innerHeight}
                      fill="#F8FAFC"
                      rx="4"
                      className="pointer-events-none"
                    />
                  )}

                  {/* Quarter Label */}
                  <text
                    x={groupX + groupWidth / 2}
                    y={padding.top + innerHeight + 25}
                    textAnchor="middle"
                    className="font-semibold text-xs fill-slate-800"
                  >
                    {quarter}
                  </text>
                  <text
                    x={groupX + groupWidth / 2}
                    y={padding.top + innerHeight + 42}
                    textAnchor="middle"
                    className="font-mono text-[10px] fill-slate-500 tabular-nums"
                  >
                    {formatCurrency(quarterTotals[quarter] || 0)}
                  </text>

                  {/* Bars for each region */}
                  {regions.map((region, rIdx) => {
                    const rev = revenueMatrix[region]?.[quarter] || 0;
                    const units = unitsMatrix[region]?.[quarter] || 0;
                    const barHeight = Math.max(2, (rev / yAxisMax) * innerHeight);
                    const barX = startOffset + rIdx * barWidth;
                    const barY = padding.top + innerHeight - barHeight;

                    return (
                      <rect
                        key={`${quarter}-${region}`}
                        x={barX}
                        y={barY}
                        width={Math.max(2, barWidth - 3)}
                        height={barHeight}
                        fill={regionColorMap[region]}
                        rx="3"
                        className="transition-all duration-150 cursor-pointer hover:opacity-80"
                        onMouseEnter={() =>
                          setHoveredBar({
                            quarter,
                            region,
                            revenue: rev,
                            units,
                            x: barX + barWidth / 2,
                            y: barY,
                          })
                        }
                        onMouseLeave={() => setHoveredBar(null)}
                      />
                    );
                  })}
                </g>
              );
            })}

          {/* MODE 2: Grouped by Region (X-axis = Regions, Bars = Quarters) */}
          {viewMode === 'byRegion' &&
            regions.map((region, rIdx) => {
              const groupWidth = innerWidth / regions.length;
              const groupX = padding.left + rIdx * groupWidth;
              const barMargin = 8;
              const availableWidth = groupWidth - barMargin * 2;
              const barWidth = Math.min(26, availableWidth / quarters.length);
              const startOffset = groupX + (groupWidth - barWidth * quarters.length) / 2;

              return (
                <g key={region}>
                  {/* Region Label */}
                  <text
                    x={groupX + groupWidth / 2}
                    y={padding.top + innerHeight + 25}
                    textAnchor="middle"
                    className="font-semibold text-xs fill-slate-800"
                  >
                    {region}
                  </text>

                  {/* Bars for each quarter */}
                  {quarters.map((quarter, qIdx) => {
                    const rev = revenueMatrix[region]?.[quarter] || 0;
                    const units = unitsMatrix[region]?.[quarter] || 0;
                    const barHeight = Math.max(2, (rev / yAxisMax) * innerHeight);
                    const barX = startOffset + qIdx * barWidth;
                    const barY = padding.top + innerHeight - barHeight;

                    // Vary opacity or lightness slightly by quarter for distinction
                    const opacity = 0.55 + (qIdx / quarters.length) * 0.45;

                    return (
                      <g key={`${region}-${quarter}`}>
                        <rect
                          x={barX}
                          y={barY}
                          width={Math.max(2, barWidth - 3)}
                          height={barHeight}
                          fill={regionColorMap[region]}
                          fillOpacity={opacity}
                          rx="3"
                          className="transition-all duration-150 cursor-pointer hover:opacity-90"
                          onMouseEnter={() =>
                            setHoveredBar({
                              quarter,
                              region,
                              revenue: rev,
                              units,
                              x: barX + barWidth / 2,
                              y: barY,
                            })
                          }
                          onMouseLeave={() => setHoveredBar(null)}
                        />
                        <text
                          x={barX + (barWidth - 3) / 2}
                          y={padding.top + innerHeight + 42}
                          textAnchor="middle"
                          className="font-mono text-[9px] fill-slate-500"
                        >
                          {quarter}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}

          {/* MODE 3: Q2 vs Q3 Focus Comparison */}
          {viewMode === 'q2q3Delta' &&
            regions.map((region, rIdx) => {
              const groupWidth = innerWidth / regions.length;
              const groupX = padding.left + rIdx * groupWidth;
              const barWidth = 34;
              const q2Rev = revenueMatrix[region]?.['Q2'] || 0;
              const q3Rev = revenueMatrix[region]?.['Q3'] || 0;
              const q2Units = unitsMatrix[region]?.['Q2'] || 0;
              const q3Units = unitsMatrix[region]?.['Q3'] || 0;

              const q2Height = Math.max(2, (q2Rev / yAxisMax) * innerHeight);
              const q3Height = Math.max(2, (q3Rev / yAxisMax) * innerHeight);

              const q2X = groupX + groupWidth / 2 - barWidth - 3;
              const q3X = groupX + groupWidth / 2 + 3;

              const q2Y = padding.top + innerHeight - q2Height;
              const q3Y = padding.top + innerHeight - q3Height;

              const delta = q3Rev - q2Rev;

              return (
                <g key={`q2q3-${region}`}>
                  {/* Region Label */}
                  <text
                    x={groupX + groupWidth / 2}
                    y={padding.top + innerHeight + 25}
                    textAnchor="middle"
                    className="font-semibold text-xs fill-slate-800"
                  >
                    {region}
                  </text>
                  <text
                    x={groupX + groupWidth / 2}
                    y={padding.top + innerHeight + 42}
                    textAnchor="middle"
                    className={`font-mono text-[10px] font-semibold tabular-nums ${
                      delta >= 0 ? 'fill-emerald-600' : 'fill-rose-600'
                    }`}
                  >
                    {delta >= 0 ? '+' : ''}{formatCurrency(delta)}
                  </text>

                  {/* Q2 Bar */}
                  <rect
                    x={q2X}
                    y={q2Y}
                    width={barWidth}
                    height={q2Height}
                    fill={regionColorMap[region]}
                    fillOpacity={0.4}
                    rx="3"
                    className="cursor-pointer hover:opacity-80"
                    onMouseEnter={() =>
                      setHoveredBar({
                        quarter: 'Q2',
                        region,
                        revenue: q2Rev,
                        units: q2Units,
                        x: q2X + barWidth / 2,
                        y: q2Y,
                      })
                    }
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                  <text
                    x={q2X + barWidth / 2}
                    y={q2Y - 6}
                    textAnchor="middle"
                    className="font-mono text-[9px] fill-slate-400"
                  >
                    Q2
                  </text>

                  {/* Q3 Bar */}
                  <rect
                    x={q3X}
                    y={q3Y}
                    width={barWidth}
                    height={q3Height}
                    fill={regionColorMap[region]}
                    rx="3"
                    className="cursor-pointer hover:opacity-80"
                    onMouseEnter={() =>
                      setHoveredBar({
                        quarter: 'Q3',
                        region,
                        revenue: q3Rev,
                        units: q3Units,
                        x: q3X + barWidth / 2,
                        y: q3Y,
                      })
                    }
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                  <text
                    x={q3X + barWidth / 2}
                    y={q3Y - 6}
                    textAnchor="middle"
                    className="font-mono text-[9px] font-semibold fill-slate-700"
                  >
                    Q3
                  </text>
                </g>
              );
            })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredBar && (
          <div
            className="absolute pointer-events-none z-20 bg-slate-900 text-white rounded-lg p-2.5 shadow-lg text-xs font-sans transform -translate-x-1/2 -translate-y-full mb-2"
            style={{
              left: `${(hoveredBar.x / svgWidth) * 100}%`,
              top: `${(hoveredBar.y / svgHeight) * 100}%`,
            }}
          >
            <div className="font-semibold text-slate-200">
              {hoveredBar.region} · {hoveredBar.quarter}
            </div>
            <div className="font-mono text-sm font-bold text-white mt-0.5">
              {formatCurrency(hoveredBar.revenue)}
            </div>
            <div className="font-mono text-[11px] text-slate-300 mt-1">
              Units: {formatNumber(hoveredBar.units)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
