import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let startDate = searchParams.get('startDate');
  let endDate = searchParams.get('endDate');

  if (!startDate || !endDate) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    startDate = start.toISOString();
    endDate = end.toISOString();
  }

  try {
    const insights = [];

    // Fetch necessary aggregates for rules
    const performanceQuery = `
      SELECT 
        ad_id,
        SUM(impressions) as impressions,
        SUM(clicks) as clicks,
        SUM(revenue) as revenue,
        CASE WHEN SUM(impressions) = 0 THEN 0 ELSE (SUM(clicks)::FLOAT / SUM(impressions)) * 100 END as ctr
      FROM ad_performance_raw
      WHERE timestamp >= $1 AND timestamp <= $2
      GROUP BY ad_id
    `;
    const targetRes = await pool.query(performanceQuery, [startDate, endDate]);
    const ads = targetRes.rows;

    // Calculate top 5% CTR threshold
    const ctrs = ads.map((a: any) => parseFloat(a.ctr)).sort((a: any, b: any) => b - a);
    const top5PercentIndex = Math.max(1, Math.floor(ctrs.length * 0.05));
    const top5PercentThreshold = ctrs[top5PercentIndex - 1] || 0;

    ads.forEach((ad: any) => {
      const impressions = parseInt(ad.impressions);
      const ctr = parseFloat(ad.ctr);
      const revenue = parseFloat(ad.revenue);

      // Rule 1: Low Engagement / Ad Fatigue
      if (impressions > 50000 && ctr < 0.5) {
        insights.push({
          id: `fatigue-${ad.ad_id}`,
          type: 'warning',
          message: `Ad ${ad.ad_id} is experiencing fatigue. High impressions (${impressions.toLocaleString()}) but critically low CTR (${ctr.toFixed(2)}%).`,
          action: 'Pause ad and overhaul creative.'
        });
      }

      // Rule 2: High Performer / Scale Opportunity
      if (ctr >= top5PercentThreshold && revenue > 1000) {
        insights.push({
          id: `scale-${ad.ad_id}`,
          type: 'success',
          message: `Ad ${ad.ad_id} is a top performer with ${ctr.toFixed(2)}% CTR and $${revenue.toLocaleString()} generated.`,
          action: 'Increase daily budget or scale this creative to broader audiences.'
        });
      }
    });

    // Rule 3: Device Discrepancy
    const deviceQuery = `
      SELECT 
        device,
        CASE WHEN SUM(impressions) = 0 THEN 0 ELSE (SUM(clicks)::FLOAT / SUM(impressions)) * 100 END as ctr
      FROM ad_performance_raw
      WHERE timestamp >= $1 AND timestamp <= $2
      GROUP BY device
    `;
    const deviceRes = await pool.query(deviceQuery, [startDate, endDate]);
    const deviceMap = deviceRes.rows.reduce((acc: any, row: any) => {
      acc[row.device.toLowerCase()] = parseFloat(row.ctr);
      return acc;
    }, {} as Record<string, number>);

    const desktopCtr = deviceMap['desktop'] || 0;
    const mobileCtr = deviceMap['mobile'] || 0;
    if (mobileCtr > 0 && desktopCtr < mobileCtr * 0.6) { // Desktop is > 40% lower
      insights.push({
        id: `device-discrepancy`,
        type: 'insight',
        message: `Desktop underperforming. Desktop CTR (${desktopCtr.toFixed(2)}%) is significantly lower than Mobile (${mobileCtr.toFixed(2)}%).`,
        action: 'Prioritize mobile traffic routing or adjust desktop bid modifiers.'
      });
    }

    return NextResponse.json({ data: insights });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}
