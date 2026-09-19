import React from 'react';
import { 
  BarChart3, 
  Layers, 
  Calendar, 
  Clock, 
  Sparkles, 
  Award, 
  PieChart as PieIcon,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs">
        <p className="font-bold text-white mb-1.5 border-b border-slate-800 pb-1">{label}</p>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}:
            </span>
            <span className="font-semibold text-white">{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function ContentAnalyticsView({ analytics }) {
  const topGenres = analytics?.topGenres || [];
  const monthlyData = analytics?.monthlyBreakdown || [];
  const ratingData = analytics?.ratingDistribution || [];
  const durationBox = analytics?.durationBox || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="glass-card-executive p-6 bg-gradient-to-r from-card via-[#1A263B] to-card border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-red-300 border border-primary/30 uppercase tracking-wider">
              Deep-Dive Module
            </span>
            <span className="text-xs text-slate-400">Taxonomy & Runtime Intelligence</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Content Taxonomy, Maturity & Engagement Dynamics
          </h2>
          <p className="text-xs text-textSecondary mt-1 max-w-2xl">
            Granular analysis of Netflix's multi-genre portfolio, content duration distributions, rating maturity ratios, and intake pacing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 uppercase">Top Genre Share</p>
            <p className="text-lg font-black text-primary">36.1%</p>
            <p className="text-[9px] text-slate-500">Dramas & Intl</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 uppercase">Avg Movie Runtime</p>
            <p className="text-lg font-black text-accent">99.3 min</p>
            <p className="text-[9px] text-slate-500">Sweet spot</p>
          </div>
        </div>
      </div>

      {/* Row 1: Full-Width Genres Bar & Seasonality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre Deep Dive */}
        <div className="glass-card-executive p-5 h-[380px] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers size={16} className="text-primary" /> Top 10 Catalog Categories
              </h3>
              <p className="text-[11px] text-slate-400">Total title representation across genres</p>
            </div>
          </div>

          <div className="flex-1 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={topGenres} 
                layout="vertical" 
                margin={{ top: 5, right: 30, left: 45, bottom: 5 }}
              >
                <XAxis type="number" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <YAxis dataKey="genre" type="category" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 10 }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {topGenres.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ingestion Seasonality */}
        <div className="glass-card-executive p-5 h-[380px] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar size={16} className="text-accent" /> Monthly Content Addition Cycles
              </h3>
              <p className="text-[11px] text-slate-400">Tracking volume spikes across calendar months</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-sky-300 border border-accent/30">
              December Top Month
            </span>
          </div>

          <div className="flex-1 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="deepMonthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <YAxis stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" stroke="#38BDF8" strokeWidth={2.5} fill="url(#deepMonthGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Duration Bins & Series Cliffhanger Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Movie Duration Bins */}
        <div className="glass-card-executive p-5">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <Clock size={16} className="text-amber-400" /> Feature Film Duration Bins
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">Distribution by runtime tiers</p>

          <div className="space-y-3">
            {(durationBox?.movieBins || []).map((bin) => {
              const maxCount = 2800;
              const pct = Math.round((bin.count / 5377) * 100);
              return (
                <div key={bin.bin}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-white">{bin.bin} ({bin.label})</span>
                    <span className="text-slate-400">{bin.count.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(bin.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TV Series Seasons Breakdown */}
        <div className="glass-card-executive p-5">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <Award size={16} className="text-red-500" /> TV Series Retention & Season Distribution
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">Tracking series renewal milestones</p>

          <div className="space-y-3">
            {(durationBox?.tvBins || []).map((bin) => {
              return (
                <div key={bin.bin}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-white">{bin.bin} — {bin.label}</span>
                    <span className="text-red-400 font-bold">{bin.count} titles ({bin.pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-500" 
                      style={{ width: `${bin.pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
