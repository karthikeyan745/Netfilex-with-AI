import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { History, TrendingUp, Flame, Check } from 'lucide-react';
import { useDashboardFilter } from '../context/FilterContext';

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

export default function RowFourCharts() {
  const { computedAnalytics, filters, toggleFilter, setFilter } = useDashboardFilter();

  const vintageData = computedAnalytics?.vintageDistribution || [];
  const growthData = computedAnalytics?.growthTrajectory || [];
  const heatmapMatrix = computedAnalytics?.heatmapMatrix || [];

  const [hoveredCell, setHoveredCell] = useState(null);

  // Maximum value in heatmap for normalized color intensity
  let maxHeatVal = 1;
  (heatmapMatrix || []).forEach(row => {
    ['TV-MA', 'TV-14', 'R', 'TV-PG', 'PG-13'].forEach(r => {
      if (row[r] > maxHeatVal) maxHeatVal = row[r];
    });
  });

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* 1. Release Trend (Area Chart) */}
      <div className="col-span-12 lg:col-span-4 glass-card-executive p-5 flex flex-col justify-between h-[380px] rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-primary">
                <History size={15} />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Release Era Trend
              </h3>
            </div>
            <p className="text-[11px] text-textSecondary mt-0.5">
              Click era to cross-filter
            </p>
          </div>
          {filters.era ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-red-300 border border-primary/40 flex items-center gap-1">
              <Check size={10} /> {filters.era}
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-red-300 border border-primary/30">
              Post-2015 Peak
            </span>
          )}
        </div>

        {/* Area Chart */}
        <div className="flex-1 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={vintageData} 
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onClick={(e) => {
                if (e && e.activeLabel) {
                  toggleFilter('era', e.activeLabel);
                }
              }}
              className="cursor-pointer"
            >
              <defs>
                <linearGradient id="eraGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E50914" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#E50914" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="era" 
                stroke="#64748B" 
                tick={{ fill: '#94A3B8', fontSize: 9 }}
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
                dataKey="count" 
                name="Titles Released" 
                stroke="#E50914" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#eraGrad)" 
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
                fill="none" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-textSecondary">
          <span>{filters.era ? `Filtered by ${filters.era}` : 'Concentrated in 2018–2020'}</span>
          <span className="text-primary font-semibold">Interactive Era Slicer</span>
        </div>
      </div>

      {/* 2. Year Wise Growth (Line Chart) */}
      <div className="col-span-12 lg:col-span-4 glass-card-executive p-5 flex flex-col justify-between h-[380px] rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-secondary/10 border border-secondary/20 text-secondary">
                <TrendingUp size={15} />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Cumulative Catalog Growth
              </h3>
            </div>
            <p className="text-[11px] text-textSecondary mt-0.5">
              Click year node to cross-filter
            </p>
          </div>
          {filters.year ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/20 text-indigo-300 border border-secondary/40 flex items-center gap-1">
              <Check size={10} /> {filters.year}
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/15 text-indigo-300 border border-secondary/30">
              Trajectory
            </span>
          )}
        </div>

        {/* Dual-metric Line Chart */}
        <div className="flex-1 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={growthData} 
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              onClick={(e) => {
                if (e && e.activeLabel) {
                  toggleFilter('year', e.activeLabel);
                }
              }}
              className="cursor-pointer"
            >
              <XAxis 
                dataKey="year" 
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
              <Legend 
                verticalAlign="top" 
                align="right" 
                wrapperStyle={{ fontSize: '10px', paddingBottom: '8px' }} 
              />
              <Line 
                type="monotone" 
                dataKey="cumulative" 
                name="Cumulative" 
                stroke="#6366F1" 
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#6366F1' }} 
                activeDot={{ r: 5 }} 
              />
              <Line 
                type="monotone" 
                dataKey="added" 
                name="Annual Net Adds" 
                stroke="#38BDF8" 
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={{ r: 2, fill: '#38BDF8' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-textSecondary">
          <span>{filters.year ? `Filtered by Year ${filters.year}` : 'Peak addition year: 2019'}</span>
          <span className="text-secondary font-semibold">Click point to slice</span>
        </div>
      </div>

      {/* 3. Genre Heatmap (Heatmap Matrix) */}
      <div className="col-span-12 lg:col-span-4 glass-card-executive p-5 flex flex-col justify-between h-[380px] rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <Flame size={15} />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Genre & Rating Matrix
              </h3>
            </div>
            <p className="text-[11px] text-textSecondary mt-0.5">
              Click cell to filter Genre + Rating
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30">
            Cross-Matrix
          </span>
        </div>

        {/* Heatmap Grid Matrix */}
        <div className="flex-1 overflow-x-auto my-1 flex flex-col justify-center">
          <div className="min-w-[280px]">
            {/* Header Row */}
            <div className="grid grid-cols-6 gap-1 mb-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center">
              <span className="text-left truncate">Genre</span>
              <span>TV-MA</span>
              <span>TV-14</span>
              <span>R</span>
              <span>TV-PG</span>
              <span>PG-13</span>
            </div>

            {/* Matrix Rows */}
            <div className="space-y-1">
              {(heatmapMatrix || []).slice(0, 6).map((row) => {
                const genreLabel = row.genre.length > 12 ? row.genre.substring(0, 11) + '…' : row.genre;
                return (
                  <div key={row.genre} className="grid grid-cols-6 gap-1 items-center">
                    <span 
                      onClick={() => toggleFilter('genre', row.genre)}
                      className="text-[10px] font-medium text-slate-300 truncate cursor-pointer hover:text-primary transition-colors" 
                      title={`Filter by ${row.genre}`}
                    >
                      {genreLabel}
                    </span>
                    {['TV-MA', 'TV-14', 'R', 'TV-PG', 'PG-13'].map((r) => {
                      const val = row[r] || 0;
                      const intensity = Math.min(1, val / Math.max(1, (maxHeatVal * 0.7)));
                      const isSelected = filters.genre === row.genre && filters.rating === r;

                      return (
                        <div
                          key={r}
                          onClick={() => {
                            if (filters.genre === row.genre && filters.rating === r) {
                              toggleFilter('genre', row.genre);
                              toggleFilter('rating', r);
                            } else {
                              setFilter('genre', row.genre);
                              setFilter('rating', r);
                            }
                          }}
                          onMouseEnter={() => setHoveredCell({ genre: row.genre, rating: r, count: val })}
                          onMouseLeave={() => setHoveredCell(null)}
                          className={`h-6 rounded flex items-center justify-center text-[9px] font-semibold transition-all cursor-pointer hover:scale-105 ${
                            isSelected 
                              ? 'ring-2 ring-white scale-105 shadow-md shadow-primary' 
                              : 'hover:ring-1 hover:ring-white/60'
                          }`}
                          style={{
                            backgroundColor: intensity > 0.05 
                              ? `rgba(229, 9, 20, ${0.15 + intensity * 0.85})` 
                              : 'rgba(30, 41, 59, 0.4)',
                            color: intensity > 0.4 ? '#FFFFFF' : '#94A3B8'
                          }}
                          title={`${row.genre} + ${r}: ${val} titles (Click to cross-filter)`}
                        >
                          {val > 0 ? val : '-'}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic Tooltip / Footer */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
          {hoveredCell ? (
            <span className="text-orange-400 font-bold">
              {hoveredCell.genre} &bull; {hoveredCell.rating}: {hoveredCell.count} titles
            </span>
          ) : (
            <span className="text-textSecondary">
              {filters.genre || filters.rating ? 'Matrix active' : 'Click cell to cross-filter'}
            </span>
          )}
          <span className="text-slate-400 text-[9px]">Power BI Drill</span>
        </div>
      </div>
    </div>
  );
}
