export interface SalesOrder {
  id?: string;
  quarter: string;
  region: string;
  channel: string;
  product: string;
  units: number;
  discount_pct: number; // 0 to 1 (e.g., 0.15 for 15%)
  revenue: number;
}

export interface ProductDriver {
  product: string;
  q2Revenue: number;
  q3Revenue: number;
  change: number;
  pctChange: number;
}

export interface ChannelDriver {
  channel: string;
  q2Revenue: number;
  q3Revenue: number;
  change: number;
  pctChange: number;
}

export interface RegionQ2Q3Change {
  region: string;
  q2Revenue: number;
  q3Revenue: number;
  absoluteChange: number; // q3Revenue - q2Revenue
  percentageChange: number; // ((q3Revenue - q2Revenue) / q2Revenue) * 100
  q2Units: number;
  q3Units: number;
  unitsChange: number;
  q2AvgDiscount: number;
  q3AvgDiscount: number;
  discountChange: number; // percentage points difference
  orderCountQ2: number;
  orderCountQ3: number;
  productDrivers: ProductDriver[];
  channelDrivers: ChannelDriver[];
  topProductDriver: ProductDriver | null;
  topChannelDriver: ChannelDriver | null;
}

export interface AggregatedStats {
  quarters: string[];
  regions: string[];
  channels: string[];
  products: string[];
  totalOrders: number;
  grandTotalRevenue: number;
  grandTotalUnits: number;
  // Matrix: [region][quarter] => revenue
  revenueMatrix: Record<string, Record<string, number>>;
  unitsMatrix: Record<string, Record<string, number>>;
  ordersMatrix: Record<string, Record<string, number>>;
  avgDiscountMatrix: Record<string, Record<string, number>>;
  quarterTotals: Record<string, number>;
  regionTotals: Record<string, number>;
  // Q2 to Q3 in-depth calculation
  q2q3Analysis: {
    hasBothQuarters: boolean;
    availableRegions: RegionQ2Q3Change[];
    mostChangedByAbsolute: RegionQ2Q3Change | null;
    mostChangedByPercentage: RegionQ2Q3Change | null;
    totalQ2Revenue: number;
    totalQ3Revenue: number;
    totalChange: number;
    totalPctChange: number;
  };
}

export interface AiSummaryResponse {
  summary: string;
  sentences: string[];
  modelUsed: string;
  calculatedContext: {
    mostChangedRegion: string;
    changeType: 'absolute' | 'percentage';
    q2Revenue: number;
    q3Revenue: number;
    absoluteChange: number;
    percentageChange: number;
    keyDriverDescription: string;
  };
  generatedAt: string;
}
