import React, { useState } from 'react';
import { Settings, Sliders, Shield, Palette, Database, HardDrive, Check, RefreshCw } from 'lucide-react';

export default function SettingsView() {
  const [accentColor, setAccentColor] = useState('red');
  const [density, setDensity] = useState('comfortable');
  const [cacheStatus, setCacheStatus] = useState('Cached (7,777 items)');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const accents = [
    { id: 'red', name: 'Netflix Crimson', hex: '#E50914' },
    { id: 'indigo', name: 'Electric Indigo', hex: '#6366F1' },
    { id: 'sky', name: 'Sky Cyan', hex: '#38BDF8' },
    { id: 'emerald', name: 'Emerald Green', hex: '#22C55E' }
  ];

  const handleRefreshCache = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setCacheStatus('Refreshed Just Now');
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="glass-card-executive p-6 bg-gradient-to-r from-card via-[#1A263B] to-card border border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
            System Preferences
          </span>
          <span className="text-xs text-slate-400">BI Workspace Configuration</span>
        </div>
        <h2 className="text-xl font-black text-white tracking-tight">
          Executive Dashboard Settings & Diagnostics
        </h2>
        <p className="text-xs text-textSecondary mt-1">
          Customize reporting defaults, visual density, export formatting, and in-memory cache allocations.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="space-y-4">
        {/* Accent Color */}
        <div className="glass-card-executive p-5">
          <div className="flex items-center gap-2 mb-2">
            <Palette size={16} className="text-primary" />
            <h3 className="text-sm font-bold text-white">Visual Theme Accent</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Select the brand accent highlighting active tabs, primary KPIs, and trend alerts.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {accents.map((acc) => (
              <button
                key={acc.id}
                onClick={() => setAccentColor(acc.id)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  accentColor === acc.id
                    ? 'border-white bg-slate-800/80 text-white shadow-lg'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: acc.hex }} />
                  <span className="text-xs font-semibold">{acc.name}</span>
                </div>
                {accentColor === acc.id && <Check size={14} className="text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Display Density */}
        <div className="glass-card-executive p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sliders size={16} className="text-accent" />
            <h3 className="text-sm font-bold text-white">Grid & Table Density</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Choose spacing density for data tables and executive analytical cards.
          </p>

          <div className="flex gap-3">
            {['compact', 'comfortable', 'spacious'].map((d) => (
              <button
                key={d}
                onClick={() => setDensity(d)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                  density === d
                    ? 'bg-primary/20 text-white border-primary/50 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* In-Memory Data Diagnostics */}
        <div className="glass-card-executive p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HardDrive size={16} className="text-emerald-400" />
              <h3 className="text-sm font-bold text-white">In-Memory Telemetry Diagnostics</h3>
            </div>
            <button
              onClick={handleRefreshCache}
              disabled={isRefreshing}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Purge & Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">Loaded Records</span>
              <p className="text-base font-bold text-white mt-0.5">7,777 Titles</p>
              <span className="text-[10px] text-emerald-400">100% verified</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">Cache Engine</span>
              <p className="text-base font-bold text-white mt-0.5">{cacheStatus}</p>
              <span className="text-[10px] text-sky-400">Zero latency</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">Data Pipeline Status</span>
              <p className="text-base font-bold text-emerald-400 mt-0.5">Production Ready</p>
              <span className="text-[10px] text-slate-400">Cleaned & Normalized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
