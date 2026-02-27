'use client';
import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

export default function RankingsPage() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [sort, setSort] = useState('revenue');
  const [order, setOrder] = useState('desc');
  const [search, setSearch] = useState('');
  const [minImpressions, setMinImpressions] = useState('0');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    let currentSort = sort;
    let currentOrder = order;
    let currentLimit = limit;
    
    if (activeTab === 'top-ctr') {
      currentSort = 'ctr'; currentOrder = 'desc'; currentLimit = 10;
    } else if (activeTab === 'bottom-ctr') {
      currentSort = 'ctr'; currentOrder = 'asc'; currentLimit = 10;
    } else if (activeTab === 'top-revenue') {
      currentSort = 'revenue'; currentOrder = 'desc'; currentLimit = 50;
    }

    setLoading(true);
    fetch(`/api/ads?page=${page}&limit=${currentLimit}&sort=${currentSort}&order=${currentOrder}&min_impressions=${minImpressions}&search=${search}`)
      .then(res => res.json())
      .then(resData => {
        setData(resData.data || []);
        setTotal(resData.total || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [page, limit, sort, order, minImpressions, search, activeTab]);

  const handleSort = (column: string) => {
    if (sort === column) {
      setOrder(order === 'desc' ? 'asc' : 'desc');
    } else {
      setSort(column);
      setOrder('desc');
    }
    setActiveTab('all');
  };

  const getStatusDot = (ctr: number) => {
    if (ctr > 2.0) return <div className="w-2.5 h-2.5 rounded-full bg-opti-success"></div>;
    if (ctr < 0.5) return <div className="w-2.5 h-2.5 rounded-full bg-opti-warning"></div>;
    return <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>;
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[28px] font-bold text-foreground">Ad Rankings</h1>

      <div className="bg-surface border border-border rounded-lg p-6 shadow-sm flex flex-col gap-4">
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-1 gap-4 items-center">
            <div className="relative w-64">
              <input 
                type="text" 
                placeholder="Search Ad ID..." 
                className="w-full h-10 pl-10 pr-4 border border-border rounded-md bg-surface text-sm focus:outline-none focus:border-opti-blue transition-colors"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); setActiveTab('all'); }}
              />
              <Search className="absolute left-3 top-2.5 text-text-secondary" size={18} />
            </div>
            <select 
              className="h-10 border border-border rounded-md px-3 bg-surface text-sm focus:outline-none focus:border-opti-blue"
              value={minImpressions}
              onChange={(e) => { setMinImpressions(e.target.value); setPage(1); }}
            >
              <option value="0">All Impressions</option>
              <option value="1000">&gt; 1k Impressions</option>
              <option value="10000">&gt; 10k Impressions</option>
              <option value="50000">&gt; 50k Impressions</option>
            </select>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-md">
            {[
              { id: 'all', label: 'All Ads' },
              { id: 'top-ctr', label: 'Top 10 CTR' },
              { id: 'bottom-ctr', label: 'Bottom 10 CTR' },
              { id: 'top-revenue', label: 'Top Revenue' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setPage(1); }}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id ? 'bg-surface shadow-sm text-foreground' : 'text-text-secondary hover:text-foreground'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-border rounded-lg mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-border">
                {['Status', 'Ad ID', 'Impressions', 'Clicks', 'CTR (%)', 'Revenue ($)', 'CPC ($)'].map((col, i) => {
                  const dbCol = col === 'Ad ID' ? 'ad_id' : col === 'CTR (%)' ? 'ctr' : col === 'Revenue ($)' ? 'revenue' : col === 'CPC ($)' ? 'cpc' : col.toLowerCase();
                  const isSortable = col !== 'Status';
                  return (
                    <th 
                      key={col} 
                      className={`p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider ${isSortable ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800' : ''}`}
                      onClick={() => isSortable && handleSort(dbCol)}
                    >
                      <div className="flex items-center gap-1">
                        {col}
                        {isSortable && <ArrowUpDown size={14} className={sort === dbCol ? 'text-opti-blue' : 'opacity-50'} />}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-text-secondary">Loading data...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-text-secondary">No ads found.</td></tr>
              ) : (
                data.map(row => (
                  <tr key={row.ad_id} className="border-b border-border hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="p-4">{getStatusDot(row.ctr)}</td>
                    <td className="p-4 font-bold text-foreground">{row.ad_id}</td>
                    <td className="p-4 text-text-secondary">{row.impressions.toLocaleString()}</td>
                    <td className="p-4 text-text-secondary">{row.clicks.toLocaleString()}</td>
                    <td className="p-4 text-text-secondary">{row.ctr.toFixed(2)}%</td>
                    <td className="p-4 text-text-secondary">${row.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="p-4 text-text-secondary">${row.cpc.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {activeTab === 'all' && total > limit && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-text-secondary">Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}</span>
            <div className="flex items-center gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded border border-border text-text-secondary hover:bg-slate-50 disabled:opacity-50"
              ><ChevronLeft size={16} /></button>
              <button 
                disabled={page * limit >= total}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded border border-border text-text-secondary hover:bg-slate-50 disabled:opacity-50"
              ><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
