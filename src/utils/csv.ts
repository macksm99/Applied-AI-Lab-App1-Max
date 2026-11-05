import { SalesOrder } from '../types.ts';

export interface ParseResult {
  orders: SalesOrder[];
  errors: string[];
  totalRows: number;
  detectedColumns: string[];
}

export function parseCSV(csvText: string): ParseResult {
  const errors: string[] = [];
  const lines = csvText.split(/\r\n|\n|\r/).filter(line => line.trim().length > 0);

  if (lines.length < 2) {
    return {
      orders: [],
      errors: ['The CSV file is empty or missing data rows.'],
      totalRows: 0,
      detectedColumns: [],
    };
  }

  // Parse header line respecting quotes
  const rawHeaders = parseCsvLine(lines[0]);
  const headers = rawHeaders.map(h => h.trim().toLowerCase().replace(/[\s_-]+/g, ''));
  
  // Map standard fields to column indices
  const getIndex = (aliases: string[]) => {
    return headers.findIndex(h => aliases.some(alias => h.includes(alias)));
  };

  const quarterIdx = getIndex(['quarter', 'qtr', 'period']);
  const regionIdx = getIndex(['region', 'territory', 'geo', 'area', 'zone']);
  const channelIdx = getIndex(['channel', 'saleschannel']);
  const productIdx = getIndex(['product', 'item', 'sku', 'offering', 'service']);
  const unitsIdx = getIndex(['unit', 'qty', 'quantity', 'volume']);
  const discountIdx = getIndex(['discount', 'discountpct', 'discountpercentage', 'discountrate']);
  const revenueIdx = getIndex(['revenue', 'sale', 'amount', 'total']);

  const missingCols: string[] = [];
  if (quarterIdx === -1) missingCols.push('quarter');
  if (regionIdx === -1) missingCols.push('region');
  if (channelIdx === -1) missingCols.push('channel');
  if (productIdx === -1) missingCols.push('product');
  if (unitsIdx === -1) missingCols.push('units');
  if (discountIdx === -1) missingCols.push('discount_pct');
  if (revenueIdx === -1) missingCols.push('revenue');

  if (missingCols.length > 0) {
    return {
      orders: [],
      errors: [`Missing required columns: ${missingCols.join(', ')}. Found: ${rawHeaders.join(', ')}`],
      totalRows: lines.length - 1,
      detectedColumns: rawHeaders,
    };
  }

  const orders: SalesOrder[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const values = parseCsvLine(rawLine);
    if (values.length < rawHeaders.length) {
      // Row has fewer columns than header, but check if key columns exist
      if (values.length <= Math.max(quarterIdx, regionIdx, revenueIdx)) {
        errors.push(`Row ${i + 1}: Insufficient column values. Skipped.`);
        continue;
      }
    }

    const quarter = cleanQuarter(values[quarterIdx]);
    const region = values[regionIdx]?.trim() || 'Unknown';
    const channel = values[channelIdx]?.trim() || 'General';
    const product = values[productIdx]?.trim() || 'Uncategorized';
    
    // Parse units
    const unitsStr = values[unitsIdx]?.replace(/[$,\s]/g, '') || '0';
    const units = parseInt(unitsStr, 10);

    // Parse discount
    const discountStr = values[discountIdx]?.replace(/[$,%\s]/g, '') || '0';
    let discount_pct = parseFloat(discountStr);
    if (discount_pct > 1) {
      // e.g. 15 or 15% -> 0.15
      discount_pct = discount_pct / 100;
    }
    if (isNaN(discount_pct)) discount_pct = 0;

    // Parse revenue
    const revenueStr = values[revenueIdx]?.replace(/[$,\s]/g, '') || '0';
    const revenue = parseFloat(revenueStr);

    if (isNaN(revenue)) {
      errors.push(`Row ${i + 1}: Invalid revenue value "${values[revenueIdx]}". Skipped.`);
      continue;
    }

    orders.push({
      id: `ord-${i}`,
      quarter: quarter || 'Q1',
      region,
      channel,
      product,
      units: isNaN(units) ? 1 : Math.max(0, units),
      discount_pct: Math.max(0, Math.min(1, discount_pct)),
      revenue: Math.round(revenue * 100) / 100,
    });
  }

  return {
    orders,
    errors,
    totalRows: lines.length - 1,
    detectedColumns: rawHeaders,
  };
}

function cleanQuarter(raw: string | undefined): string {
  if (!raw) return 'Q1';
  const val = raw.trim().toUpperCase();
  // Match Q1, Q2, Q3, Q4, 2024-Q1, 2024 Q1, etc.
  const match = val.match(/Q[1-4]/);
  if (match) return match[0];
  // If numeric 1, 2, 3, 4
  if (['1', '2', '3', '4'].includes(val)) return `Q${val}`;
  return val;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function exportToCSV(filename: string, rows: (string | number)[][], headers: string[]) {
  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row => row.map(cell => {
      if (typeof cell === 'string') {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
