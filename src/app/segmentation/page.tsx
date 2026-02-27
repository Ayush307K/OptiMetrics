'use client';
import React, { useState, useEffect } from 'react';
import { useDateContext } from '@/context/DateContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SegmentationPage() {
  const { dateRange } = useDateContext();
  const [deviceData, setDeviceData] = useState<any[]>([]);
  const [countryData, setCountryData] = useState<any[]>([]);
  const [deviceMetric, setDeviceMetric] = useState('revenue');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dateRange.startDate) return;
    setLoading(true);
    fetch(`/api/segmentation?dimension=device&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
      .then(res => res.json())
      .then(resData => setDeviceData(resData.data || []));

    fetch(`/api/segmentation?dimension=country&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
      .then(res => res.json())
      .then(resData => {
        setCountryData(resData.data || []);
        setLoading(false);
      });
  }, [dateRange]);

  const deviceChartData = deviceData.map(d => ({
    name: d.name.charAt(0).toUpperCase() + d.name.slice(1),
    value: d[deviceMetric]
  }));

  const formatChartValue = (val: number) => deviceMetric === 'revenue' ? `$${val}` : deviceMetric === 'ctr' ? `${val}%` : val.toLocaleString();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-[28px] font-bold text-foreground">Segmentation Analysis</h1>

      {loading ? (
        <div className="text-text-secondary">Loading segmentation data...</div>
      ) : (
        <>
          {/* Section 1: Device */}
          <section className="bg-surface border border-border rounded-lg p-6 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-semibold text-foreground">Device Breakdown</h2>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-md">
                {[{ id: 'revenue', label: 'Revenue' }, { id: 'ctr', label: 'CTR' }, { id: 'impressions', label: 'Impressions' }].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setDeviceMetric(tab.id)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${deviceMetric === tab.id ? 'bg-surface shadow-sm text-foreground' : 'text-text-secondary hover:text-foreground'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deviceChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                  <XAxis type="number" tickFormatter={formatChartValue} tick={{ fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#0F172A', fontWeight: 500 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip 
                    formatter={(value: any) => [formatChartValue(Number(value)), deviceMetric.toUpperCase()]}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#FFFFFF', borderRadius: '4px', border: 'none' }}
                  />
                  <Bar dataKey="value" fill="#1E3A8A" radius={[0, 4, 4, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto border border-border rounded-lg mt-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-border">
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase">Device</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase">Impressions</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase">Clicks</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase">CTR (%)</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase">Revenue ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {deviceData.map(row => (
                    <tr key={row.name} className="border-b border-border hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="p-4 font-medium text-foreground capitalize">{row.name}</td>
                      <td className="p-4 text-text-secondary">{row.impressions.toLocaleString()}</td>
                      <td className="p-4 text-text-secondary">{row.clicks.toLocaleString()}</td>
                      <td className="p-4 text-text-secondary">{row.ctr.toFixed(2)}%</td>
                      <td className="p-4 text-text-secondary">${row.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 2: Country */}
          <section className="bg-surface border border-border rounded-lg p-6 shadow-sm flex flex-col gap-6">
            <h2 className="text-[20px] font-semibold text-foreground">Top 10 Countries by Revenue</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(val) => `$${val}`} tick={{ fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#FFFFFF', borderRadius: '4px', border: 'none' }}
                  />
                  <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto border border-border rounded-lg mt-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-border">
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase">Country</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase">Revenue ($)</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase">CTR (%)</th>
                    <th className="p-4 text-xs font-semibold text-text-secondary uppercase">Impressions</th>
                  </tr>
                </thead>
                <tbody>
                  {countryData.map(row => (
                    <tr key={row.name} className="border-b border-border hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="p-4 font-bold text-foreground">{row.name}</td>
                      <td className="p-4 text-text-secondary">${row.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="p-4 text-text-secondary">{row.ctr.toFixed(2)}%</td>
                      <td className="p-4 text-text-secondary">{row.impressions.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
