import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'File contains no data rows' }, { status: 400 });
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['ad_id', 'user_id', 'clicks', 'impressions', 'revenue', 'device', 'country', 'timestamp'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      return NextResponse.json({ error: `Missing required headers: ${missingHeaders.join(', ')}` }, { status: 400 });
    }

    const headerIndices = requiredHeaders.map(h => headers.indexOf(h));

    const values = [];
    const params = [];
    let paramIndex = 1;

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(v => v.trim());
      if (row.length !== headers.length) continue;

      const [ad_id, user_id, clicks, impressions, revenue, device, country, timestamp] = headerIndices.map(idx => row[idx]);

      values.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
      params.push(ad_id, user_id, parseInt(clicks), parseInt(impressions), parseFloat(revenue), device, country, timestamp);

      // Batch insert logic if lines are too large for a single query (Postgres has ~65535 param limit)
      if (params.length > 50000) {
        const batchQuery = `INSERT INTO ad_performance_raw (ad_id, user_id, clicks, impressions, revenue, device, country, timestamp) VALUES ${values.join(',')}`;
        await pool.query(batchQuery, params);
        values.length = 0;
        params.length = 0;
        paramIndex = 1;
      }
    }

    if (values.length > 0) {
      const query = `INSERT INTO ad_performance_raw (ad_id, user_id, clicks, impressions, revenue, device, country, timestamp) VALUES ${values.join(',')}`;
      await pool.query(query, params);
    }

    return NextResponse.json({ message: 'Ingestion successful', rowsProcessed: lines.length - 1 });
  } catch (error) {
    console.error('Ingest Error:', error);
    return NextResponse.json({ error: 'Failed to ingest data' }, { status: 500 });
  }
}
