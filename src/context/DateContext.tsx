'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type DateRange = { startDate: string; endDate: string };
type Preset = 'today' | 'last7' | 'last30' | 'thisYear' | 'custom';

interface DateContextType {
  dateRange: DateRange;
  preset: Preset;
  setPreset: (preset: Preset) => void;
  setCustomRange: (start: string, end: string) => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export function DateProvider({ children }: { children: React.ReactNode }) {
  const [preset, setPreset] = useState<Preset>('last30');
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: '', endDate: '' });

  useEffect(() => {
    if (preset === 'custom') return;
    const end = new Date();
    const start = new Date();
    if (preset === 'today') {
      start.setHours(0,0,0,0);
    } else if (preset === 'last7') {
      start.setDate(start.getDate() - 7);
    } else if (preset === 'last30') {
      start.setDate(start.getDate() - 30);
    } else if (preset === 'thisYear') {
      start.setMonth(0, 1);
    }
    setDateRange({
      startDate: start.toISOString(),
      endDate: end.toISOString()
    });
  }, [preset]);

  const setCustomRange = (startDate: string, endDate: string) => {
    setPreset('custom');
    setDateRange({ startDate, endDate });
  };

  return (
    <DateContext.Provider value={{ dateRange, preset, setPreset, setCustomRange }}>
      {children}
    </DateContext.Provider>
  );
}

export function useDateContext() {
  const context = useContext(DateContext);
  if (!context) throw new Error('useDateContext must be used within DateProvider');
  return context;
}
