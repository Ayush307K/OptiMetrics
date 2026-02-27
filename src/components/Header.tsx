'use client';
import React, { useEffect, useState } from 'react';
import { useDateContext } from '@/context/DateContext';
import { Download, Moon, Sun, User } from 'lucide-react';

export default function Header() {
  const { preset, setPreset, dateRange, setCustomRange } = useDateContext();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const exportData = () => {
    alert("Exporting data to CSV..."); // Mocked for now
  };

  return (
    <header className="h-16 bg-surface border-b border-border fixed top-0 w-full z-20 flex items-center justify-between px-6 transition-colors">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded bg-opti-blue flex items-center justify-center text-white font-bold">O</div>
        <span className="text-xl font-bold text-foreground">OptiMetrics</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <select 
            className="h-10 border border-border rounded-md px-3 bg-surface text-text-secondary text-sm focus:outline-none focus:border-opti-light-blue transition-colors"
            value={preset}
            onChange={(e) => setPreset(e.target.value as any)}
          >
            <option value="today">Today</option>
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
            <option value="thisYear">This Year</option>
            <option value="custom">Custom</option>
          </select>

          {preset === 'custom' && (
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                className="h-10 border border-border rounded-md px-3 bg-surface text-sm text-text-secondary transition-colors"
                onChange={(e) => setCustomRange(new Date(e.target.value).toISOString(), dateRange.endDate)}
              />
              <span className="text-text-secondary">to</span>
              <input 
                type="date" 
                className="h-10 border border-border rounded-md px-3 bg-surface text-sm text-text-secondary transition-colors"
                onChange={(e) => setCustomRange(dateRange.startDate, new Date(e.target.value).toISOString())}
              />
            </div>
          )}
        </div>

        <button onClick={exportData} className="flex items-center gap-2 border border-border rounded-md px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-foreground transition-colors text-sm">
          <Download size={16} />
          <span>Export</span>
        </button>

        <button onClick={toggleDarkMode} className="text-text-secondary hover:text-opti-blue transition-colors">
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="w-8 h-8 rounded-full bg-slate-200 border border-border overflow-hidden flex flex-shrink-0 items-center justify-center">
          <User size={16} className="text-slate-500" />
        </div>
      </div>
    </header>
  );
}
