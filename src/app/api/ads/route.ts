import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const sort = searchParams.get('sort') || 'revenue';
  const order = (searchParams.get('order') || 'desc').toUpperCase();
  const minImpressions = parseInt(searchParams.get('min_impressions') || '0');
  const search = searchParams.get('search') || '';

  const allowedSorts = ['ad_id', 'impressions', 'clicks', 'ctr', 'revenue', 'cpc'];
  const sortColumn = allowedSorts.includes(sort) ? sort : 'revenue';
  const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';

  const offset = (page - 1) * limit;

  try {
    const params: any[] = [];
    let whereClauses = [];

    if (search) {
      params.push(`%${search}%`);
      whereClauses.push(`ad_id ILIKE $${params.length}`);
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const baseQuery = `
      SELECT 
        ad_id,
        SUM(impressions) as impressions,
        SUM(clicks) as clicks,
        SUM(revenue) as revenue,
        CASE WHEN SUM(impressions) = 0 THEN 0 ELSE (SUM(clicks)::FLOAT / SUM(impressions)) * 100 END as ctr,
        CASE WHEN SUM(clicks) = 0 THEN 0 ELSE (SUM(revenue)::FLOAT / SUM(clicks)) END as cpc
      FROM ad_performance_raw
      ${whereStr}
      GROUP BY ad_id
      HAVING SUM(impressions) >= ${minImpressions}
    `;

    const dataQuery = `
      ${baseQuery}
      ORDER BY ${sortColumn} ${sortOrder}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countQuery = `
      SELECT COUNT(*) as total FROM (
        ${baseQuery}
      ) as sub
    `;

    // Execute queries using same parameterized params for both
    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, params),
      pool.query(countQuery, params)
    ]);

    return NextResponse.json({
      data: dataRes.rows.map((row: any) => ({
        ...row,
        impressions: parseInt(row.impressions),
        clicks: parseInt(row.clicks),
        revenue: parseFloat(row.revenue),
        ctr: parseFloat(row.ctr),
        cpc: parseFloat(row.cpc)
      })),
      total: parseInt(countRes.rows[0].total),
      page,
      limit
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
  }
}
