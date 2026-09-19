import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { Calendar, PieChart as PieIcon, Layers, Check } from 'lucide-react';
import { useDashboardFilter } from '../context/FilterContext';

// Custom Tooltip for Charts
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

export default function RowTwoCharts() {
  const { computedAnalytics, filters, toggleFilter } = useDashboardFilter();

  const monthlyData = computedAnalytics?.monthlyBreakdown || [];
  const typeStats = computedAnalytics?.typeComparison || {};
  const topGenres = computedAnalytics?.topGenres || [];

  // Donut Chart Data
  const donutData = [
    { name: 'Movies', value: typeStats?.movies?.count || 0, color: '#E50914', type: 'Movie' },
    { name: 'TV Shows', value: typeStats?.tvShows?.count || 0, color: '#38BDF8', type: 'TV Show' }
  ];
  const totalTitles = (donutData[0].value + donutData[1].value) || 1;
  const moviePct = Math.round((donutData[0].value / totalTitles) * 100);
  const tvPct = 100 - moviePct;

  // Top Genres Data (Top 8 for clean height)
  const barData = (topGenres || []).slice(0, 8).map(g => ({
    name: g.genre.length > 18 ? g.genre.substring(0, 18) + '…' : g.genre,
    fullName: g.genre,
    count: g.count,
    color: g.color || '#E50914',
    isSelected: filters.genre === g.genre
  }));

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* 1. Monthly Content Added (Area / Line Chart) */}
      <div className="col-span-12 lg:col-span-4 glass-card-executive p-5 flex flex-col justify-between h-[380px] rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                <Calendar size={15} />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Monthly Content Ingestion
              </h3>
            </div>
            <p className="text-[11px] text-textSecondary mt-0.5">
              Click month to cross-filter dashboard
            </p>
          </div>
          {filters.month ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-red-300 border border-primary/40 flex items-center gap-1">
              <Check size={10} /> {filters.month}
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-red-300 border border-primary/30">
              Q4 Spike
            </span>
          )}
        </div>

        {/* Chart Container */}
        <div className="flex-1 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={monthlyData} 
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onClick={(e) => {
                if (e && e.activeLabel) {
                  toggleFilter('month', e.activeLabel);
                }
              }}
              className="cursor-pointer"
            >
              <defs>
                <linearGradient id="monthTotalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E50914" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#E50914" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="monthTvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                stroke="#64748B" 
                tick={{ fill: '#94A3B8', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              />
              <YAxis 
                stroke="#64748B" 
                tick={{ fill: '#94A3B8', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="total" 
                name="Total Titles" 
                stroke="#E50914" 
                strokeWidth={2}
                fillOpacity={filters.month ? 0.8 : 1} 
                fill="url(#monthTotalGrad)" 
              />
              <Area 
                type="monotone" 
                dataKey="movies" 
                name="Movies" 
                stroke="#FB923C" 
                strokeWidth={1.5}
                fill="none" 
              />
              <Area 
                type="monotone" 
                dataKey="tvShows" 
                name="TV Shows" 
                stroke="#38BDF8" 
                strokeWidth={1.5}
                fillOpacity={1} 
                fill="url(#monthTvGrad)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Legend Footer */}
        <div className="flex items-center justify-center gap-6 pt-2 border-t border-white/5 text-[11px] text-textSecondary">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span>Total Intake</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FB923C]" />
            <span>Movies</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
            <span>TV Series</span>
          </div>
        </div>
      </div>

      {/* 2. Movies vs TV Shows (Donut Chart) */}
      <div className="col-span-12 lg:col-span-4 glass-card-executive p-5 flex flex-col justify-between h-[380px] rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <PieIcon size={15} />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Catalog Mix: Movies vs TV
              </h3>
            </div>
            <p className="text-[11px] text-textSecondary mt-0.5">
              Click slice to filter by content type
            </p>
          </div>
          {filters.type ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-red-300 border border-primary/40 flex items-center gap-1">
              <Check size={10} /> {filters.type}
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              {moviePct}% / {tvPct}%
            </span>
          )}
        </div>

        {/* Donut Chart with Center Text */}
        <div className="relative flex-1 flex items-center justify-center cursor-pointer">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={86}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                onClick={(entry) => toggleFilter('type', entry.type)}
              >
                {donutData.map((entry, index) => {
                  const isSelected = filters.type === entry.type;
                  const isDimmed = filters.type && !isSelected;
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      fillOpacity={isDimmed ? 0.35 : 1}
                      stroke={isSelected ? '#FFFFFF' : 'none'}
                      strokeWidth={isSelected ? 2 : 0}
                      className="transition-all duration-300 hover:opacity-100"
                    />
                  );
                })}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total Indicator */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-textSecondary uppercase font-medium">Catalog</span>
            <span className="text-xl font-extrabold text-white">{totalTitles.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400">Total Items</span>
          </div>
        </div>

        {/* Mix breakdown interactive buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
          <button
            onClick={() => toggleFilter('type', 'Movie')}
            className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
              filters.type === 'Movie'
                ? 'bg-primary/20 border-primary shadow-sm'
                : 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <div className="text-left">
                <p className="text-[10px] text-textSecondary">Movies</p>
                <p className="text-xs font-bold text-white">{donutData[0].value.toLocaleString()}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-primary">{moviePct}%</span>
          </button>

          <button
            onClick={() => toggleFilter('type', 'TV Show')}
            className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
              filters.type === 'TV Show'
                ? 'bg-sky-500/20 border-sky-500 shadow-sm'
                : 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
              <div className="text-left">
                <p className="text-[10px] text-textSecondary">TV Shows</p>
                <p className="text-xs font-bold text-white">{donutData[1].value.toLocaleString()}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#38BDF8]">{tvPct}%</span>
          </button>
        </div>
      </div>

      {/* 3. Top Genres (Horizontal Bar Chart) */}
      <div className="col-span-12 lg:col-span-4 glass-card-executive p-5 flex flex-col justify-between h-[380px] rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Layers size={15} />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Top Performing Genres
              </h3>
            </div>
            <p className="text-[11px] text-textSecondary mt-0.5">
              Click genre bar to cross-filter
            </p>
          </div>
          {filters.genre ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 truncate max-w-[130px]">
              <Check size={10} /> {filters.genre}
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Dramas #1
            </span>
          )}
        </div>

        {/* Horizontal Bar Chart */}
        <div className="flex-1 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={barData} 
              layout="vertical" 
              margin={{ top: 5, right: 20, left: 35, bottom: 5 }}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  toggleFilter('genre', e.activePayload[0].payload.fullName);
                }
              }}
              className="cursor-pointer"
            >
              <XAxis 
                type="number" 
                stroke="#64748B" 
                tick={{ fill: '#94A3B8', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="#64748B" 
                tick={{ fill: '#94A3B8', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                width={70}
              />
              <Tooltip 
                formatter={(val, name, props) => [`${val.toLocaleString()} titles`, props.payload.fullName]}
                content={<CustomTooltip />}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {barData.map((entry, index) => {
                  const isSelected = filters.genre === entry.fullName;
                  const isDimmed = filters.genre && !isSelected;
                  return (
                    <Cell 
                      key={`bar-${index}`} 
                      fill={entry.color} 
                      fillOpacity={isDimmed ? 0.35 : 1}
                      stroke={isSelected ? '#FFFFFF' : 'none'}
                      strokeWidth={isSelected ? 2 : 0}
                      className="transition-all duration-300"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-textSecondary">
          <span>{filters.genre ? `Filtered by ${filters.genre}` : 'Leading genre: Dramas'}</span>
          <span className="text-emerald-400 font-semibold">
            {filters.genre ? 'Click to toggle' : 'Cross-filter active'}
          </span>
        </div>
      </div>
    </div>
  );
}
