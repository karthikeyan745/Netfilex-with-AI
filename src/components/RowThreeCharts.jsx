import React from 'react';
import { 
  Globe, 
  BarChart2, 
  Clock, 
  Check
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell 
} from 'recharts';
import { useDashboardFilter } from '../context/FilterContext';
import WorldChoroplethMap from './WorldChoroplethMap';

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

export default function RowThreeCharts() {
  const { 
    computedAnalytics, 
    filters, 
    toggleFilter, 
    selectedCountries 
  } = useDashboardFilter();

  const ratingData = computedAnalytics?.ratingDistribution || [];
  const durationData = computedAnalytics?.durationBox || {};
  const totalCountries = computedAnalytics?.kpis?.uniqueCountries || 117;

  const movieBox = durationData?.movies || { min: 15, q1: 86, median: 98, q3: 114, max: 180, mean: 99.3 };
  const tvBins = durationData?.tvBins || [
    { bin: '1 Season', count: 1603, pct: 66.8, label: 'Single Season' },
    { bin: '2 Seasons', count: 420, pct: 17.5, label: 'Sophomore' },
    { bin: '3 Seasons', count: 197, pct: 8.2, label: 'Established' },
    { bin: '4+ Seasons', count: 180, pct: 7.5, label: 'Flagship Franchise' }
  ];

  const ratingChartData = (ratingData || []).slice(0, 7).map(r => ({
    rating: r.rating,
    Movies: r.movies,
    'TV Shows': r.tvShows,
    total: r.count,
    isSelected: filters.rating === r.rating
  }));

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* 1. Global Production Footprint: Interactive Vector Choropleth World Map */}
      <div className="col-span-12 lg:col-span-4 glass-card-executive p-5 flex flex-col justify-between h-[440px] rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Globe size={15} />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                🌍 Global Production Footprint
              </h3>
            </div>
            <p className="text-[11px] text-textSecondary mt-0.5">
              Click a country to filter dashboard
            </p>
          </div>
          {selectedCountries.length > 0 ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-red-300 border border-primary/40 flex items-center gap-1 shadow-sm">
              <Check size={10} /> {selectedCountries.length === 1 ? selectedCountries[0] : `${selectedCountries.length} Countries`}
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
              Countries: {totalCountries}
            </span>
          )}
        </div>

        {/* High-Performance SVG Choropleth Vector World Map */}
        <WorldChoroplethMap />
      </div>

      {/* 2. Ratings Distribution Histogram */}
      <div className="col-span-12 lg:col-span-4 glass-card-executive p-5 flex flex-col justify-between h-[440px] rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <BarChart2 size={15} />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Maturity & Content Ratings
              </h3>
            </div>
            <p className="text-[11px] text-textSecondary mt-0.5">
              Click rating bar to cross-filter
            </p>
          </div>
          {filters.rating ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
              <Check size={10} /> {filters.rating}
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              TV-MA Dominant
            </span>
          )}
        </div>

        {/* Histogram Chart */}
        <div className="flex-1 w-full my-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={ratingChartData} 
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  toggleFilter('rating', e.activePayload[0].payload.rating);
                }
              }}
              className="cursor-pointer"
            >
              <XAxis 
                dataKey="rating" 
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
              <Bar dataKey="Movies" stackId="a" fill="#E50914">
                {ratingChartData.map((entry, index) => {
                  const isDimmed = filters.rating && filters.rating !== entry.rating;
                  return <Cell key={`m-${index}`} fillOpacity={isDimmed ? 0.35 : 1} />;
                })}
              </Bar>
              <Bar dataKey="TV Shows" stackId="a" fill="#38BDF8" radius={[4, 4, 0, 0]}>
                {ratingChartData.map((entry, index) => {
                  const isDimmed = filters.rating && filters.rating !== entry.rating;
                  return <Cell key={`t-${index}`} fillOpacity={isDimmed ? 0.35 : 1} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-textSecondary">
          <span>{filters.rating ? `Filtered by ${filters.rating}` : 'Click bar to cross-filter'}</span>
          <span className="text-amber-400 font-semibold">Adult skewing audience</span>
        </div>
      </div>

      {/* 3. Duration Distribution: Box Plot & TV Seasons Attrition */}
      <div className="col-span-12 lg:col-span-4 glass-card-executive p-5 flex flex-col justify-between h-[440px] rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <Clock size={15} />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Duration Quartiles & Attrition
              </h3>
            </div>
            <p className="text-[11px] text-textSecondary mt-0.5">
              Click tier to filter by duration
            </p>
          </div>
          {filters.durationTier ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1">
              <Check size={10} /> {filters.durationTier}
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
              Median: {movieBox.median}m
            </span>
          )}
        </div>

        {/* Statistical Box Plot Representation */}
        <div className="space-y-3 py-1 flex-1 flex flex-col justify-center">
          {/* Movie Runtime Box Plot */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-white">Movie Runtime Spread (Minutes)</span>
              <span className="text-primary font-bold text-xs font-mono">IQR: {movieBox.q1}m – {movieBox.q3}m</span>
            </div>

            {/* Custom SVG Box Plot */}
            <div className="relative h-10 w-full flex items-center">
              <div className="w-full h-1 bg-slate-700 rounded relative">
                <div 
                  className="absolute top-0 bottom-0 bg-slate-500"
                  style={{ 
                    left: `${(movieBox.min / 180) * 100}%`, 
                    right: `${100 - (movieBox.max / 180) * 100}%` 
                  }}
                />
                <div 
                  className="absolute -top-3.5 h-8 bg-primary/30 border-2 border-primary rounded-md flex items-center justify-center backdrop-blur-sm shadow-md"
                  style={{ 
                    left: `${(movieBox.q1 / 180) * 100}%`, 
                    width: `${Math.max(4, ((movieBox.q3 - movieBox.q1) / 180) * 100)}%` 
                  }}
                >
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-sm"
                    style={{ 
                      left: `${((movieBox.median - movieBox.q1) / Math.max(1, (movieBox.q3 - movieBox.q1))) * 100}%` 
                    }}
                    title={`Median: ${movieBox.median}m`}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>Min: {movieBox.min}m</span>
              <span className="text-white font-bold">Median: {movieBox.median}m</span>
              <span>Max: {movieBox.max}m</span>
            </div>
          </div>

          {/* TV Season Attrition Breakdown */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-white">TV Series Longevity</span>
              <span className="text-red-400 font-bold text-[11px]">
                {tvBins[0]?.pct || 66.8}% Single Season
              </span>
            </div>
            
            {/* Clickable Multi-segment stacked bar */}
            <div className="w-full h-4 rounded-lg overflow-hidden flex bg-slate-800 cursor-pointer shadow-inner">
              {tvBins.map((b, i) => {
                const colors = ['bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-sky-500'];
                const isSelected = filters.durationTier === b.bin;
                return (
                  <div 
                    key={b.bin}
                    onClick={() => toggleFilter('durationTier', b.bin)}
                    style={{ width: `${Math.max(2, b.pct)}%` }} 
                    className={`${colors[i % colors.length]} h-full transition-all hover:opacity-80 ${
                      isSelected ? 'ring-2 ring-white' : ''
                    }`}
                    title={`${b.bin}: ${b.count} titles (${b.pct}%) - Click to filter`} 
                  />
                );
              })}
            </div>

            <div className="grid grid-cols-4 gap-1 text-[9px] mt-1.5 text-center">
              {tvBins.map(b => (
                <button
                  key={b.bin}
                  onClick={() => toggleFilter('durationTier', b.bin)}
                  className={`truncate rounded px-1 py-0.5 transition-colors ${
                    filters.durationTier === b.bin ? 'bg-white/20 font-bold text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {b.bin}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-textSecondary">
          <span>{filters.durationTier ? `Filtered by ${filters.durationTier}` : 'Click TV season to filter'}</span>
          <span className="text-sky-400 font-semibold">Interactive Cross-Filter</span>
        </div>
      </div>
    </div>
  );
}
