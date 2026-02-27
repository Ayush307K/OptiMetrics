'use client';
import React, { useState, useEffect } from 'react';
import { useDateContext } from '@/context/DateContext';
import { AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

export default function InsightsPage() {
  const { dateRange } = useDateContext();
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dateRange.startDate) return;
    setLoading(true);
    fetch(`/api/insights?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
      .then(res => res.json())
      .then(resData => {
        setInsights(resData.data || []);
        setLoading(false);
      });
  }, [dateRange]);

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <h1 className="text-[28px] font-bold text-foreground">Insights & Alerts</h1>
      
      {loading ? (
        <div className="text-text-secondary">Running anomaly engine...</div>
      ) : insights.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-8 text-center text-text-secondary">
          No anomalies detected for the selected period.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {insights.map(insight => {
            let Icon = Lightbulb;
            let bgColor = 'bg-slate-50 border-slate-200';
            let iconColor = 'text-opti-insight';
            
            if (insight.type === 'warning') {
              Icon = AlertTriangle;
              bgColor = 'bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-opti-warning/30';
              iconColor = 'text-opti-warning';
            } else if (insight.type === 'success') {
              Icon = CheckCircle;
              bgColor = 'bg-green-50 border-green-100 dark:bg-green-950/20 dark:border-opti-success/30';
              iconColor = 'text-opti-success';
            }

            return (
              <div key={insight.id} className={`flex gap-4 p-5 rounded-lg border ${bgColor}`}>
                <div className={`mt-1 ${iconColor}`}>
                  <Icon size={24} />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-[16px] text-foreground font-medium">{insight.message}</p>
                  <p className="text-[14px] text-text-secondary font-medium">Recommended Action: {insight.action}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
