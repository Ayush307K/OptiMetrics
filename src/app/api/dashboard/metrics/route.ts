import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let startDate = searchParams.get('startDate');
  let endDate = searchParams.get('endDate');

  // Default to last 30 days if not provided
  if (!startDate || !endDate) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    startDate = start.toISOString();
    endDate = end.toISOString();
  }

  // Calculate the previous period for comparison
  const startMs = new Date(startDate).getTime();
  const endMs = new Date(endDate).getTime();
  const diff = endMs - startMs;
  const prevStartDate = new Date(startMs - diff).toISOString();
  const prevEndDate = new Date(startMs).toISOString();

  try {
    const currentQuery = `
      SELECT 
        SUM(impressions) as impressions,
        SUM(clicks) as clicks,
        SUM(revenue) as revenue
      FROM ad_performance_raw
      WHERE timestamp >= $1 AND timestamp <= $2
    `;
    
    const prevQuery = `
      SELECT 
        SUM(impressions) as impressions,
        SUM(clicks) as clicks,
        SUM(revenue) as revenue
      FROM ad_performance_raw
      WHERE timestamp >= $1 AND timestamp <= $2
    `;

    // Chart Data: Group by Date
    const chartQuery = `
      SELECT 
        DATE(timestamp) as date,
        SUM(revenue) as revenue,
        CASE WHEN SUM(impressions) = 0 THEN 0 ELSE (SUM(clicks)::FLOAT / SUM(impressions)) * 100 END as ctr
      FROM ad_performance_raw
      WHERE timestamp >= $1 AND timestamp <= $2
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `;

    // Device Breakdown Data
    const deviceQuery = `
      SELECT 
        device,
        SUM(revenue) as revenue
      FROM ad_performance_raw
      WHERE timestamp >= $1 AND timestamp <= $2
      GROUP BY device
    `;

    const [currentRes, prevRes, chartRes, deviceRes] = await Promise.all([
      pool.query(currentQuery, [startDate, endDate]),
      pool.query(prevQuery, [prevStartDate, prevEndDate]),
      pool.query(chartQuery, [startDate, endDate]),
      pool.query(deviceQuery, [startDate, endDate]),
    ]);

    const curr = currentRes.rows[0];
    const prev = prevRes.rows[0];
    
    const parse = (val: any) => parseFloat(val) || 0;

    const currImpressions = parse(curr.impressions);
    const prevImpressions = parse(prev.impressions);
    const currClicks = parse(curr.clicks);
    const prevClicks = parse(prev.clicks);
    const currRevenue = parse(curr.revenue);
    const prevRevenue = parse(prev.revenue);

    const currCtr = currImpressions > 0 ? (currClicks / currImpressions) * 100 : 0;
    const prevCtr = prevImpressions > 0 ? (prevClicks / prevImpressions) * 100 : 0;

    const currCpc = currClicks > 0 ? (currRevenue / currClicks) : 0;
    const prevCpc = prevClicks > 0 ? (prevRevenue / prevClicks) : 0;

    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const metrics = {
      impressions: {
        value: currImpressions,
        change: calcChange(currImpressions, prevImpressions)
      },
      clicks: {
        value: currClicks,
        change: calcChange(currClicks, prevClicks)
      },
      ctr: {
        value: currCtr,
        change: calcChange(currCtr, prevCtr)
      },
      revenue: {
        value: currRevenue,
        change: calcChange(currRevenue, prevRevenue)
      },
      cpc: {
        value: currCpc,
        change: calcChange(currCpc, prevCpc)
      }
    };

    return NextResponse.json({
      metrics,
      chartData: chartRes.rows.map((row: any) => ({
        date: new Date(row.date).toISOString().split('T')[0],
        revenue: parse(row.revenue),
        ctr: parse(row.ctr)
      })),
      deviceData: deviceRes.rows.map((row: any) => ({
        name: row.device,
        value: parse(row.revenue)
      }))
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
