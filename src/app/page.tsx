'use client';

import React, { useEffect, useState } from 'react';
import { useDateContext } from '@/context/DateContext';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const COLORS = ['#1E3A8A', '#3B82F6', '#8B5CF6']; // Opti Blue, Light Blue, Insight Purple

export default function Dashboard() {
  const { dateRange } = useDateContext();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dateRange.startDate) return;
    setLoading(true);
    fetch(`/api/dashboard/metrics?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [dateRange]);

  if (loading || !data) {
    return <div className="flex items-center justify-center h-full text-text-secondary">Loading Dashboard...</div>;
  }

  const { metrics, chartData, deviceData } = data;

  const MetricCard = ({ title, metric, format, isCurrency = false, isPercent = false }: any) => {
    const isUp = metric?.change > 0;
    const isDown = metric?.change < 0;
    const formattedValue = isCurrency 
      ? `$${(metric?.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : isPercent 
        ? `${(metric?.value || 0).toFixed(2)}%`
        : (metric?.value || 0).toLocaleString();

    let changeColor = 'text-text-secondary';
    let Icon = Minus;
    if (isUp) {
      changeColor = 'text-opti-success';
      Icon = TrendingUp;
    } else if (isDown) {
      changeColor = 'text-opti-warning';
      Icon = TrendingDown;
    }

    return (
      <div className="bg-surface border border-border rounded-lg p-6 shadow-sm flex flex-col justify-between">
        <h3 className="text-text-secondary text-[14px] font-medium mb-2">{title}</h3>
        <div className="text-[36px] font-semibold text-foreground leading-[1.2]">{formattedValue}</div>
        <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${changeColor}`}>
          <Icon size={16} />
          <span>{Math.abs(metric?.change || 0).toFixed(1)}% vs prev period</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[28px] font-bold text-foreground">Dashboard</h1>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        <MetricCard title="Total Impressions" metric={metrics?.impressions} />
        <MetricCard title="Total Clicks" metric={metrics?.clicks} />
        <MetricCard title="Average CTR" metric={metrics?.ctr} isPercent />
        <MetricCard title="Total Revenue" metric={metrics?.revenue} isCurrency />
        <MetricCard title="Average CPC" metric={metrics?.cpc} isCurrency />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        
        {/* Combo Chart */}
        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm lg:col-span-2 flex flex-col">
          <h2 className="text-[20px] font-semibold text-foreground mb-6">Performance Over Time</h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{fill: '#64748B'}} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" tickFormatter={(val) => `$${val}`} tick={{fill: '#64748B'}} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => `${val}%`} tick={{fill: '#64748B'}} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFFFFF', borderRadius: '4px', border: 'none' }}
                  itemStyle={{ color: '#FFFFFF' }}
                  labelStyle={{ color: '#94A3B8', marginBottom: '4px' }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" name="Revenue ($)" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="ctr" name="CTR (%)" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm flex flex-col">
          <h2 className="text-[20px] font-semibold text-foreground mb-6">Revenue by Device</h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `$${Number(value).toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFFFFF', borderRadius: '4px', border: 'none' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
