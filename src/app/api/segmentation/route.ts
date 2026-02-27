import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let dimension = searchParams.get('dimension') || 'device';
  let startDate = searchParams.get('startDate');
  let endDate = searchParams.get('endDate');

  if (dimension !== 'device' && dimension !== 'country') {
    dimension = 'device';
  }

  if (!startDate || !endDate) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    startDate = start.toISOString();
    endDate = end.toISOString();
  }

  try {
    const query = `
      SELECT 
        ${dimension},
        SUM(impressions) as impressions,
        SUM(clicks) as clicks,
        SUM(revenue) as revenue,
        CASE WHEN SUM(impressions) = 0 THEN 0 ELSE (SUM(clicks)::FLOAT / SUM(impressions)) * 100 END as ctr
      FROM ad_performance_raw
      WHERE timestamp >= $1 AND timestamp <= $2
      GROUP BY ${dimension}
      ORDER BY revenue DESC
    `;

    const result = await pool.query(query, [startDate, endDate]);

    return NextResponse.json({
      data: result.rows.map((row: any) => ({
        name: row[dimension],
        impressions: parseInt(row.impressions),
        clicks: parseInt(row.clicks),
        revenue: parseFloat(row.revenue),
        ctr: parseFloat(row.ctr)
      }))
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch segmentation' }, { status: 500 });
  }
}
