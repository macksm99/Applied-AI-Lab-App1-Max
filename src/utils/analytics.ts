import { AggregatedStats, ChannelDriver, ProductDriver, RegionQ2Q3Change, SalesOrder } from '../types.ts';

export function computeAggregatedStats(orders: SalesOrder[]): AggregatedStats {
  const quarterSet = new Set<string>();
  const regionSet = new Set<string>();
  const channelSet = new Set<string>();
  const productSet = new Set<string>();

  const revenueMatrix: Record<string, Record<string, number>> = {};
  const unitsMatrix: Record<string, Record<string, number>> = {};
  const ordersMatrix: Record<string, Record<string, number>> = {};
  const discountSumMatrix: Record<string, Record<string, number>> = {};
  const avgDiscountMatrix: Record<string, Record<string, number>> = {};

  // For granular Q2 vs Q3 driver tracking: [region][quarter][product] = sum(rev)
  const productQuarterRev: Record<string, Record<string, Record<string, number>>> = {};
  const channelQuarterRev: Record<string, Record<string, Record<string, number>>> = {};

  let grandTotalRevenue = 0;
  let grandTotalUnits = 0;

  for (const order of orders) {
    const { quarter, region, channel, product, units, discount_pct, revenue } = order;
    quarterSet.add(quarter);
    regionSet.add(region);
    channelSet.add(channel);
    productSet.add(product);

    grandTotalRevenue += revenue;
    grandTotalUnits += units;

    if (!revenueMatrix[region]) revenueMatrix[region] = {};
    if (!unitsMatrix[region]) unitsMatrix[region] = {};
    if (!ordersMatrix[region]) ordersMatrix[region] = {};
    if (!discountSumMatrix[region]) discountSumMatrix[region] = {};
    if (!productQuarterRev[region]) productQuarterRev[region] = {};
    if (!channelQuarterRev[region]) channelQuarterRev[region] = {};

    revenueMatrix[region][quarter] = (revenueMatrix[region][quarter] || 0) + revenue;
    unitsMatrix[region][quarter] = (unitsMatrix[region][quarter] || 0) + units;
    ordersMatrix[region][quarter] = (ordersMatrix[region][quarter] || 0) + 1;
    discountSumMatrix[region][quarter] = (discountSumMatrix[region][quarter] || 0) + discount_pct;

    if (!productQuarterRev[region][quarter]) productQuarterRev[region][quarter] = {};
    productQuarterRev[region][quarter][product] = (productQuarterRev[region][quarter][product] || 0) + revenue;

    if (!channelQuarterRev[region][quarter]) channelQuarterRev[region][quarter] = {};
    channelQuarterRev[region][quarter][channel] = (channelQuarterRev[region][quarter][channel] || 0) + revenue;
  }

  // Sort quarters naturally (Q1, Q2, Q3, Q4...)
  const quarterOrder: Record<string, number> = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };
  const quarters = Array.from(quarterSet).sort((a, b) => {
    const valA = quarterOrder[a] || 99;
    const valB = quarterOrder[b] || 99;
    return valA !== valB ? valA - valB : a.localeCompare(b);
  });

  const regions = Array.from(regionSet).sort();
  const channels = Array.from(channelSet).sort();
  const products = Array.from(productSet).sort();

  // Compute average discounts and totals
  const quarterTotals: Record<string, number> = {};
  const regionTotals: Record<string, number> = {};

  for (const q of quarters) {
    quarterTotals[q] = 0;
  }
  for (const r of regions) {
    regionTotals[r] = 0;
    avgDiscountMatrix[r] = {};
    for (const q of quarters) {
      const rev = revenueMatrix[r]?.[q] || 0;
      const count = ordersMatrix[r]?.[q] || 0;
      const discSum = discountSumMatrix[r]?.[q] || 0;
      avgDiscountMatrix[r][q] = count > 0 ? discSum / count : 0;
      regionTotals[r] += rev;
      quarterTotals[q] += rev;
    }
  }

  // Q2 to Q3 In-depth Comparison
  const hasBothQuarters = quarterSet.has('Q2') && quarterSet.has('Q3');
  const availableRegions: RegionQ2Q3Change[] = [];

  if (hasBothQuarters) {
    for (const r of regions) {
      const q2Rev = revenueMatrix[r]?.['Q2'] || 0;
      const q3Rev = revenueMatrix[r]?.['Q3'] || 0;
      const absoluteChange = q3Rev - q2Rev;
      const percentageChange = q2Rev > 0 ? ((q3Rev - q2Rev) / q2Rev) * 100 : (q3Rev > 0 ? 100 : 0);

      const q2Units = unitsMatrix[r]?.['Q2'] || 0;
      const q3Units = unitsMatrix[r]?.['Q3'] || 0;
      const unitsChange = q3Units - q2Units;

      const q2AvgDiscount = avgDiscountMatrix[r]?.['Q2'] || 0;
      const q3AvgDiscount = avgDiscountMatrix[r]?.['Q3'] || 0;
      const discountChange = (q3AvgDiscount - q2AvgDiscount) * 100; // in percentage points

      // Calculate product drivers
      const productDrivers: ProductDriver[] = [];
      for (const prod of products) {
        const prodQ2 = productQuarterRev[r]?.['Q2']?.[prod] || 0;
        const prodQ3 = productQuarterRev[r]?.['Q3']?.[prod] || 0;
        const change = prodQ3 - prodQ2;
        const pctChange = prodQ2 > 0 ? (change / prodQ2) * 100 : (prodQ3 > 0 ? 100 : 0);
        if (prodQ2 > 0 || prodQ3 > 0) {
          productDrivers.push({
            product: prod,
            q2Revenue: prodQ2,
            q3Revenue: prodQ3,
            change,
            pctChange,
          });
        }
      }
      productDrivers.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

      // Calculate channel drivers
      const channelDrivers: ChannelDriver[] = [];
      for (const ch of channels) {
        const chQ2 = channelQuarterRev[r]?.['Q2']?.[ch] || 0;
        const chQ3 = channelQuarterRev[r]?.['Q3']?.[ch] || 0;
        const change = chQ3 - chQ2;
        const pctChange = chQ2 > 0 ? (change / chQ2) * 100 : (chQ3 > 0 ? 100 : 0);
        if (chQ2 > 0 || chQ3 > 0) {
          channelDrivers.push({
            channel: ch,
            q2Revenue: chQ2,
            q3Revenue: chQ3,
            change,
            pctChange,
          });
        }
      }
      channelDrivers.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

      availableRegions.push({
        region: r,
        q2Revenue: Math.round(q2Rev * 100) / 100,
        q3Revenue: Math.round(q3Rev * 100) / 100,
        absoluteChange: Math.round(absoluteChange * 100) / 100,
        percentageChange: Math.round(percentageChange * 10) / 10,
        q2Units,
        q3Units,
        unitsChange,
        q2AvgDiscount: Math.round(q2AvgDiscount * 1000) / 10, // e.g. 14.5%
        q3AvgDiscount: Math.round(q3AvgDiscount * 1000) / 10,
        discountChange: Math.round(discountChange * 10) / 10,
        orderCountQ2: ordersMatrix[r]?.['Q2'] || 0,
        orderCountQ3: ordersMatrix[r]?.['Q3'] || 0,
        productDrivers,
        channelDrivers,
        topProductDriver: productDrivers[0] || null,
        topChannelDriver: channelDrivers[0] || null,
      });
    }
  }

  // Sort available regions by absolute change magnitude
  const sortedByAbs = [...availableRegions].sort((a, b) => Math.abs(b.absoluteChange) - Math.abs(a.absoluteChange));
  const sortedByPct = [...availableRegions].sort((a, b) => Math.abs(b.percentageChange) - Math.abs(a.percentageChange));

  const totalQ2Revenue = quarterTotals['Q2'] || 0;
  const totalQ3Revenue = quarterTotals['Q3'] || 0;
  const totalChange = totalQ3Revenue - totalQ2Revenue;
  const totalPctChange = totalQ2Revenue > 0 ? (totalChange / totalQ2Revenue) * 100 : 0;

  return {
    quarters,
    regions,
    channels,
    products,
    totalOrders: orders.length,
    grandTotalRevenue: Math.round(grandTotalRevenue * 100) / 100,
    grandTotalUnits,
    revenueMatrix,
    unitsMatrix,
    ordersMatrix,
    avgDiscountMatrix,
    quarterTotals,
    regionTotals,
    q2q3Analysis: {
      hasBothQuarters,
      availableRegions: sortedByAbs,
      mostChangedByAbsolute: sortedByAbs[0] || null,
      mostChangedByPercentage: sortedByPct[0] || null,
      totalQ2Revenue: Math.round(totalQ2Revenue * 100) / 100,
      totalQ3Revenue: Math.round(totalQ3Revenue * 100) / 100,
      totalChange: Math.round(totalChange * 100) / 100,
      totalPctChange: Math.round(totalPctChange * 10) / 10,
    },
  };
}

export function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);
}

export function formatPercentage(val: number, includeSign = true): string {
  const sign = includeSign && val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat('en-US').format(val);
}

/**
 * Deterministic mathematical summary adhering strictly to the 3-sentence constraint
 * using ONLY the exact calculated numbers.
 */
export function generateDeterministicThreeSentenceSummary(q2q3: AggregatedStats['q2q3Analysis']): {
  summary: string;
  sentences: string[];
} {
  if (!q2q3.hasBothQuarters || !q2q3.mostChangedByAbsolute) {
    const text = 'The current dataset does not contain both Q2 and Q3 sales figures. Please ensure orders for both quarters are loaded to calculate the quarterly change. Once both quarters are present, a three-sentence regional change analysis will be computed.';
    return { summary: text, sentences: [text] };
  }

  const primary = q2q3.mostChangedByAbsolute;
  const absSign = primary.absoluteChange >= 0 ? 'increased' : 'decreased';
  const absDeltaFormatted = formatCurrency(Math.abs(primary.absoluteChange));
  const q2Formatted = formatCurrency(primary.q2Revenue);
  const q3Formatted = formatCurrency(primary.q3Revenue);
  const pctFormatted = formatPercentage(primary.percentageChange);

  // Sentence 1: Identification of the region and exact change figures
  const sentence1 = `${primary.region} changed the most in revenue from Q2 to Q3, shifting from ${q2Formatted} to ${q3Formatted}, which represents an ${absSign} of ${absDeltaFormatted} (${pctFormatted}).`;

  // Sentence 2: Underlying drivers (why) citing calculated product and channel shifts
  let sentence2 = '';
  const topProd = primary.topProductDriver;
  const topChan = primary.topChannelDriver;

  if (topProd && topChan) {
    const prodSign = topProd.change >= 0 ? 'grew' : 'declined';
    const chanSign = topChan.change >= 0 ? 'expanding' : 'contracting';
    sentence2 = `This variance was primarily driven by ${topProd.product} which ${prodSign} by ${formatCurrency(Math.abs(topProd.change))} (from ${formatCurrency(topProd.q2Revenue)} to ${formatCurrency(topProd.q3Revenue)}), alongside ${topChan.channel} sales ${chanSign} by ${formatCurrency(Math.abs(topChan.change))}.`;
  } else if (topProd) {
    const prodSign = topProd.change >= 0 ? 'rose' : 'dropped';
    sentence2 = `This performance was led by ${topProd.product}, where revenue ${prodSign} by ${formatCurrency(Math.abs(topProd.change))} while total regional volume shifted by ${formatNumber(primary.unitsChange)} units.`;
  } else {
    sentence2 = `This change was accompanied by a net volume shift of ${formatNumber(primary.unitsChange)} units across ${primary.orderCountQ3} sales orders compared to ${primary.orderCountQ2} orders in Q2.`;
  }

  // Sentence 3: Comparison with total company shift or second closest region
  let sentence3 = '';
  const runnerUp = q2q3.availableRegions.length > 1 ? q2q3.availableRegions[1] : null;

  if (runnerUp) {
    const runnerSign = runnerUp.absoluteChange >= 0 ? 'gained' : 'lost';
    sentence3 = `In contrast, the next closest regional movement occurred in ${runnerUp.region}, which ${runnerSign} ${formatCurrency(Math.abs(runnerUp.absoluteChange))} (${formatPercentage(runnerUp.percentageChange)}) against a total quarterly company delta of ${formatCurrency(q2q3.totalChange)} (${formatPercentage(q2q3.totalPctChange)}).`;
  } else {
    sentence3 = `Overall company revenue across all regions shifted by ${formatCurrency(q2q3.totalChange)} (${formatPercentage(q2q3.totalPctChange)}) between Q2 and Q3.`;
  }

  const sentences = [sentence1, sentence2, sentence3];
  return {
    summary: sentences.join(' '),
    sentences,
  };
}
