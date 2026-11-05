import React, { useState, useMemo } from 'react';
import { SalesOrder } from '../types.ts';
import { formatCurrency, formatNumber } from '../utils/analytics.ts';
import { exportToCSV } from '../utils/csv.ts';
import { Search, Filter, Download, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface RawOrdersTableProps {
  orders: SalesOrder[];
  quarters: string[];
  regions: string[];
}

export const RawOrdersTable: React.FC<RawOrdersTableProps> = ({ orders, quarters, regions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof SalesOrder>('revenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchQuarter = selectedQuarter === 'all' || order.quarter === selectedQuarter;
      const matchRegion = selectedRegion === 'all' || order.region === selectedRegion;
      const matchSearch =
        searchTerm === '' ||
        order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.channel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.region.toLowerCase().includes(searchTerm.toLowerCase());
      return matchQuarter && matchRegion && matchSearch;
    });
  }, [orders, selectedQuarter, selectedRegion, searchTerm]);

  // Sorted orders
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      const strA = String(valA || '').toLowerCase();
      const strB = String(valB || '').toLowerCase();
      return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filteredOrders, sortField, sortDirection]);

  // Paginated orders
  const totalPages = Math.ceil(sortedOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedOrders.slice(start, start + pageSize);
  }, [sortedOrders, currentPage, pageSize]);

  const toggleSort = (field: keyof SalesOrder) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExport = () => {
    const headers = ['Quarter', 'Region', 'Channel', 'Product', 'Units', 'Discount %', 'Revenue'];
    const rows = sortedOrders.map((o) => [
      o.quarter,
      o.region,
      o.channel,
      o.product,
      o.units,
      `${(o.discount_pct * 100).toFixed(1)}%`,
      o.revenue,
    ]);
    exportToCSV('sales_orders_filtered.csv', rows, headers);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Raw Sales Orders Dataset
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual line orders with granular discounts, unit volumes, and channel attributes
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          Export ({sortedOrders.length} orders)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by product, channel, or region..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Quarter Filter */}
          <select
            value={selectedQuarter}
            onChange={(e) => {
              setSelectedQuarter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Quarters</option>
            {quarters.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>

          {/* Region Filter */}
          <select
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
              <th
                onClick={() => toggleSort('quarter')}
                className="py-2.5 px-3.5 cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center gap-1">
                  <span>Quarter</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('region')}
                className="py-2.5 px-3.5 cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center gap-1">
                  <span>Region</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('channel')}
                className="py-2.5 px-3.5 cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center gap-1">
                  <span>Channel</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('product')}
                className="py-2.5 px-3.5 cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center gap-1">
                  <span>Product</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('units')}
                className="py-2.5 px-3.5 text-right font-mono cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Units</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('discount_pct')}
                className="py-2.5 px-3.5 text-right font-mono cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Discount</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('revenue')}
                className="py-2.5 px-3.5 text-right font-mono cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Revenue</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No orders match your search criteria.
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order, idx) => (
                <tr key={order.id || idx} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3.5 font-mono font-semibold text-slate-900">
                    {order.quarter}
                  </td>
                  <td className="py-2.5 px-3.5 font-medium text-slate-900">{order.region}</td>
                  <td className="py-2.5 px-3.5 text-slate-600">{order.channel}</td>
                  <td className="py-2.5 px-3.5 font-medium text-slate-800">{order.product}</td>
                  <td className="py-2.5 px-3.5 text-right font-mono tabular-nums text-slate-700">
                    {formatNumber(order.units)}
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-mono tabular-nums text-slate-600">
                    {(order.discount_pct * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatCurrency(order.revenue)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-700">
            {filteredOrders.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-700">
            {Math.min(currentPage * pageSize, filteredOrders.length)}
          </span>{' '}
          of <span className="font-semibold text-slate-700">{filteredOrders.length}</span> orders
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <span className="font-mono text-slate-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
