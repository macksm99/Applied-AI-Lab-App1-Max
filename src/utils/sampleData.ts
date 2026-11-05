import { SalesOrder } from '../types.ts';

export const SAMPLE_SALES_ORDERS: SalesOrder[] = [
  // --- NORTH AMERICA (Q1 - Q4) ---
  { quarter: 'Q1', region: 'North America', channel: 'Direct Enterprise', product: 'Cloud Data Platform', units: 45, discount_pct: 0.10, revenue: 405000 },
  { quarter: 'Q1', region: 'North America', channel: 'Strategic Partners', product: 'Sentinel Security', units: 70, discount_pct: 0.15, revenue: 297500 },
  { quarter: 'Q1', region: 'North America', channel: 'Online Portal', product: 'AI Automation CoPilot', units: 120, discount_pct: 0.05, revenue: 228000 },
  { quarter: 'Q1', region: 'North America', channel: 'Inside Sales', product: 'Quantum Edge Hub', units: 30, discount_pct: 0.12, revenue: 158400 },

  { quarter: 'Q2', region: 'North America', channel: 'Direct Enterprise', product: 'Cloud Data Platform', units: 65, discount_pct: 0.08, revenue: 598000 },
  { quarter: 'Q2', region: 'North America', channel: 'Strategic Partners', product: 'Sentinel Security', units: 85, discount_pct: 0.12, revenue: 374000 },
  { quarter: 'Q2', region: 'North America', channel: 'Online Portal', product: 'AI Automation CoPilot', units: 160, discount_pct: 0.05, revenue: 304000 },
  { quarter: 'Q2', region: 'North America', channel: 'Inside Sales', product: 'Quantum Edge Hub', units: 42, discount_pct: 0.10, revenue: 226800 },

  { quarter: 'Q3', region: 'North America', channel: 'Direct Enterprise', product: 'Cloud Data Platform', units: 50, discount_pct: 0.14, revenue: 430000 },
  { quarter: 'Q3', region: 'North America', channel: 'Strategic Partners', product: 'Sentinel Security', units: 72, discount_pct: 0.16, revenue: 302400 },
  { quarter: 'Q3', region: 'North America', channel: 'Online Portal', product: 'AI Automation CoPilot', units: 155, discount_pct: 0.06, revenue: 291400 },
  { quarter: 'Q3', region: 'North America', channel: 'Inside Sales', product: 'Quantum Edge Hub', units: 35, discount_pct: 0.12, revenue: 184800 },

  { quarter: 'Q4', region: 'North America', channel: 'Direct Enterprise', product: 'Cloud Data Platform', units: 80, discount_pct: 0.06, revenue: 752000 },
  { quarter: 'Q4', region: 'North America', channel: 'Strategic Partners', product: 'Sentinel Security', units: 110, discount_pct: 0.10, revenue: 495000 },
  { quarter: 'Q4', region: 'North America', channel: 'Online Portal', product: 'AI Automation CoPilot', units: 210, discount_pct: 0.04, revenue: 403200 },
  { quarter: 'Q4', region: 'North America', channel: 'Inside Sales', product: 'Quantum Edge Hub', units: 58, discount_pct: 0.08, revenue: 320160 },

  // --- EMEA (Q1 - Q4) ---
  { quarter: 'Q1', region: 'EMEA', channel: 'Direct Enterprise', product: 'Cloud Data Platform', units: 38, discount_pct: 0.12, revenue: 334400 },
  { quarter: 'Q1', region: 'EMEA', channel: 'Strategic Partners', product: 'Sentinel Security', units: 62, discount_pct: 0.18, revenue: 254200 },
  { quarter: 'Q1', region: 'EMEA', channel: 'Online Portal', product: 'AI Automation CoPilot', units: 95, discount_pct: 0.08, revenue: 174800 },
  { quarter: 'Q1', region: 'EMEA', channel: 'Inside Sales', product: 'Quantum Edge Hub', units: 25, discount_pct: 0.15, revenue: 127500 },

  { quarter: 'Q2', region: 'EMEA', channel: 'Direct Enterprise', product: 'Cloud Data Platform', units: 48, discount_pct: 0.10, revenue: 432000 },
  { quarter: 'Q2', region: 'EMEA', channel: 'Strategic Partners', product: 'Sentinel Security', units: 75, discount_pct: 0.14, revenue: 322500 },
  { quarter: 'Q2', region: 'EMEA', channel: 'Online Portal', product: 'AI Automation CoPilot', units: 115, discount_pct: 0.06, revenue: 216200 },
  { quarter: 'Q2', region: 'EMEA', channel: 'Inside Sales', product: 'Quantum Edge Hub', units: 32, discount_pct: 0.12, revenue: 168960 },

  { quarter: 'Q3', region: 'EMEA', channel: 'Direct Enterprise', product: 'Cloud Data Platform', units: 52, discount_pct: 0.11, revenue: 462800 },
  { quarter: 'Q3', region: 'EMEA', channel: 'Strategic Partners', product: 'Sentinel Security', units: 82, discount_pct: 0.13, revenue: 356700 },
  { quarter: 'Q3', region: 'EMEA', channel: 'Online Portal', product: 'AI Automation CoPilot', units: 130, discount_pct: 0.05, revenue: 247000 },
  { quarter: 'Q3', region: 'EMEA', channel: 'Inside Sales', product: 'Quantum Edge Hub', units: 36, discount_pct: 0.10, revenue: 194400 },

  { quarter: 'Q4', region: 'EMEA', channel: 'Direct Enterprise', product: 'Cloud Data Platform', units: 65, discount_pct: 0.09, revenue: 591500 },
  { quarter: 'Q4', region: 'EMEA', channel: 'Strategic Partners', product: 'Sentinel Security', units: 98, discount_pct: 0.12, revenue: 431200 },
  { quarter: 'Q4', region: 'EMEA', channel: 'Online Portal', product: 'AI Automation CoPilot', units: 165, discount_pct: 0.05, revenue: 313500 },
  { quarter: 'Q4', region: 'EMEA', channel: 'Inside Sales', product: 'Quantum Edge Hub', units: 45, discount_pct: 0.08, revenue: 248400 },

  // --- APAC (Q1 - Q4) --- (Key Q2->Q3 Growth Driver Region!)
  { quarter: 'Q1', region: 'APAC', channel: 'Direct Enterprise', product: 'Cloud Data Platform', units: 30, discount_pct: 0.15, revenue: 255000 },
  { quarter: 'Q1', region: 'APAC', channel: 'Strategic Partners', product: 'Sentinel Security', units: 50, discount_pct: 0.20, revenue: 200000 },
  { quarter: 'Q1', region: 'APAC', channel: 'Online Portal', product: 'AI Automation CoPilot', units: 80, discount_pct: 0.10, revenue: 144000 },
  { quarter: 'Q1', region: 'APAC', channel: 'Inside Sales', product: 'Quantum Edge Hub', units: 20, discount_pct: 0.16, revenue: 100800 },

  { quarter: 'Q2', region: 'APAC', channel: 'Direct Enterprise', product: 'Cloud Data Platform', units: 35, discount_pct: 0.14, revenue: 301000 },
  { quarter: 'Q2', region: 'APAC', channel: 'Strategic Partners', product: 'Sentinel Security', units: 58, discount_pct: 0.18, revenue: 237800 },
  { quarter: 'Q2', region: 'APAC', channel: 'Online Portal', product: 'AI Automation CoPilot', units: 92, discount_pct: 0.08, revenue: 169280 },
  { quarter: 'Q2', region: 'APAC', channel: 'Inside Sales', product: 'Quantum Edge Hub', units: 24, discount_pct: 0.15, revenue: 122400 },

  // Q3 APAC experiences dramatic surge: units leap, especially AI Automation CoPilot & Cloud Data Platform
  { quarter: 'Q3', region: 'APAC', channel: 'Direct Enterprise', product: 'Cloud Data Platform', units: 78, discount_pct: 0.08, revenue: 717600 },
  { quarter: 'Q3', region: 'APAC', channel: 'Strategic Partners', product: 'Sentinel Security', units: 95, discount_pct: 0.10, revenue: 427500 },
  { quarter: 'Q3', region: 'APAC', channel: 'Online Portal', product: 'AI Automation CoPilot', units: 260, discount_pct: 0.04, revenue: 499200 },
  { quarter: 'Q3', region: 'APAC', channel: 'Inside Sales', product: 'Quantum Edge Hub', units: 54, discount_pct: 0.09, revenue: 294840 },

  { quarter: 'Q4', region: 'APAC', channel: 'Direct Enterprise', product: 'Cloud Data Platform', units: 90, discount_pct: 0.07, revenue: 837000 },
  { quarter: 'Q4', region: 'APAC', channel: 'Strategic Partners', product: 'Sentinel Security', units: 115, discount_pct: 0.08, revenue: 529000 },
  { quarter: 'Q4', region: 'APAC', channel: 'Online Portal', product: 'AI Automation CoPilot', units: 310, discount_pct: 0.03, revenue: 601400 },
  { quarter: 'Q4', region: 'APAC', channel: 'Inside Sales', product: 'Quantum Edge Hub', units: 62, discount_pct: 0.08, revenue: 342240 },

  // --- LATAM (Q1 - Q4) ---
  { quarter: 'Q1', region: 'LATAM', channel: 'Direct Enterprise', product: 'Cloud Data Platform', units: 18, discount_pct: 0.18, revenue: 147600 },
  { quarter: 'Q1', region: 'LATAM', channel: 'Strategic Partners', product: 'Sentinel Security', units: 32, discount_pct: 0.22, revenue: 124800 },
  { quarter: 'Q1', region: 'LATAM', channel: 'Online Portal', product: 'AI Automation CoPilot', units: 45, discount_pct: 0.12, revenue: 79200 },
  { quarter: 'Q1', region: 'LATAM', channel: 'Inside Sales', product: 'Quantum Edge Hub', units: 14, discount_pct: 0.18, revenue: 68880 },

  { quarter: 'Q2', region: 'LATAM', channel: 'Direct Enterprise', product: 'Cloud Data Platform', units: 22, discount_pct: 0.16, revenue: 184800 },
  { quarter: 'Q2', region: 'LATAM', channel: 'Strategic Partners', product: 'Sentinel Security', units: 38, discount_pct: 0.20, revenue: 152000 },
  { quarter: 'Q2', region: 'LATAM', channel: 'Online Portal', product: 'AI Automation CoPilot', units: 58, discount_pct: 0.10, revenue: 104400 },
  { quarter: 'Q2', region: 'LATAM', channel: 'Inside Sales', product: 'Quantum Edge Hub', units: 18, discount_pct: 0.16, revenue: 90720 },

  { quarter: 'Q3', region: 'LATAM', channel: 'Direct Enterprise', product: 'Cloud Data Platform', units: 26, discount_pct: 0.15, revenue: 221000 },
  { quarter: 'Q3', region: 'LATAM', channel: 'Strategic Partners', product: 'Sentinel Security', units: 44, discount_pct: 0.18, revenue: 180400 },
  { quarter: 'Q3', region: 'LATAM', channel: 'Online Portal', product: 'AI Automation CoPilot', units: 70, discount_pct: 0.08, revenue: 128800 },
  { quarter: 'Q3', region: 'LATAM', channel: 'Inside Sales', product: 'Quantum Edge Hub', units: 21, discount_pct: 0.15, revenue: 107100 },

  { quarter: 'Q4', region: 'LATAM', channel: 'Direct Enterprise', product: 'Cloud Data Platform', units: 32, discount_pct: 0.14, revenue: 275200 },
  { quarter: 'Q4', region: 'LATAM', channel: 'Strategic Partners', product: 'Sentinel Security', units: 52, discount_pct: 0.16, revenue: 218400 },
  { quarter: 'Q4', region: 'LATAM', channel: 'Online Portal', product: 'AI Automation CoPilot', units: 88, discount_pct: 0.07, revenue: 163680 },
  { quarter: 'Q4', region: 'LATAM', channel: 'Inside Sales', product: 'Quantum Edge Hub', units: 26, discount_pct: 0.14, revenue: 134160 },
];

export function generateSampleCsvString(): string {
  const headers = ['quarter', 'region', 'channel', 'product', 'units', 'discount_pct', 'revenue'];
  const rows = SAMPLE_SALES_ORDERS.map(order => [
    order.quarter,
    `"${order.region}"`,
    `"${order.channel}"`,
    `"${order.product}"`,
    order.units,
    order.discount_pct,
    order.revenue
  ].join(','));
  return [headers.join(','), ...rows].join('\n');
}
