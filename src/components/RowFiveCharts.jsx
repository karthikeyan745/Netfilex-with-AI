import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Treemap 
} from 'recharts';
import { UserCheck, Users, Languages, Check, Film, Globe } from 'lucide-react';
import { useDashboardFilter } from '../context/FilterContext';

// Netflix Executive Curated Color Palette for Treemap
const NETFLIX_TREEMAP_PALETTE = [
  '#E50914', '#DC2626', '#B91C1C', '#EA580C', '#C2410C', 
  '#BE123C', '#4F46E5', '#4338CA', '#7C3AED', '#0F766E', 
  '#0284C7', '#334155'
];

function CustomBarTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs">
        <p className="font-bold text-white mb-1.5 border-b border-slate-800 pb-1">{data.fullName || label}</p>
        <div className="space-y-1 text-slate-300">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Total Directed:</span>
            <span className="font-bold text-white">{data.count} titles</span>
          </div>
          {data.topWork && data.topWork !== 'N/A' && (
            <div className="flex items-center justify-between gap-4 text-[11px]">
              <span className="text-slate-400">Key Production:</span>
              <span className="text-red-400 font-medium truncate max-w-[130px]">{data.topWork}</span>
            </div>
          )}
        </div>
        <p className="text-[9px] text-slate-400 mt-2 pt-1 border-t border-slate-800 text-center">
          Click bar to cross-filter dashboard
        </p>
      </div>
    );
  }
  return null;
}

// Custom Treemap Content Tile with Proportional Layout & Dynamic Font Scaling
const TreemapTile = (props) => {
  const { x, y, width, height, index, name, value, onSelectActor, selectedActor, country, onHoverTile } = props;
  if (!name || width < 25 || height < 16) return null;

  const color = NETFLIX_TREEMAP_PALETTE[(index || 0) % NETFLIX_TREEMAP_PALETTE.length];
  const isSelected = selectedActor === name;
  const isDimmed = selectedActor && !isSelected;

  // Prevent text overlapping: only render label if tile is sufficiently large
  const canShowLabel = width >= 55 && height >= 32;
  const canShowSubtitle = width >= 65 && height >= 48;

  // Dynamic font size and safe truncation
  const maxChars = Math.max(5, Math.floor(width / 7.5));
  const displayName = typeof name === 'string' 
    ? (name.length > maxChars ? name.substring(0, maxChars - 1) + '…' : name) 
    : '';
  const fontSize = Math.min(11, Math.max(8.5, Math.floor(width / 9.5)));

  return (
    <g 
      onClick={() => onSelectActor && onSelectActor(name)} 
      onMouseEnter={(e) => onHoverTile && onHoverTile({ name, value, country, x: e.clientX, y: e.clientY })}
      onMouseLeave={() => onHoverTile && onHoverTile(null)}
      className="cursor-pointer transition-all duration-200"
    >
      <rect
        x={x + 1.5}
        y={y + 1.5}
        width={Math.max(0, width - 3)}
        height={Math.max(0, height - 3)}
        rx={8}
        fill={color}
        fillOpacity={isDimmed ? 0.35 : isSelected ? 1 : 0.84}
        stroke={isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.18)'}
        strokeWidth={isSelected ? 2 : 1}
        className="transition-all duration-150 hover:fill-opacity-100"
        style={{
          filter: isSelected ? 'drop-shadow(0 0 6px rgba(229, 9, 20, 0.8))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'
        }}
      />
      {canShowLabel && (
        <text
          x={x + width / 2}
          y={y + (canShowSubtitle ? height / 2 - 5 : height / 2 + 1)}
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize={fontSize}
          fontWeight="bold"
          pointerEvents="none"
          className="select-none"
        >
          {displayName}
        </text>
      )}
      {canShowSubtitle && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 10}
          textAnchor="middle"
          fill="rgba(255,255,255,0.85)"
          fontSize={9}
          fontWeight="600"
          pointerEvents="none"
          className="select-none font-mono"
        >
          {value} titles
        </text>
      )}
    </g>
  );
};

export default function RowFiveCharts() {
  const { computedAnalytics, filters, toggleFilter } = useDashboardFilter();

  const topDirectors = computedAnalytics?.topDirectos || [];
  const topActors = computedAnalytics?.topActors || [];
  const regionalData = computedAnalytics?.regionalSummary || [];

  // Hover state for treemap tooltip
  const [hoveredActor, setHoveredActor] = useState(null);

  // Director bar chart data (Top 6)
  const directorData = (topDirectors || []).slice(0, 6).map(d => ({
    name: d.director.length > 15 ? d.director.substring(0, 14) + '…' : d.director,
    fullName: d.director,
    count: d.count,
    topWork: d.topWork,
    isSelected: filters.director === d.director
  }));

  // Actors treemap data (Top 12)
  const actorTreeData = (topActors || []).slice(0, 12).map((a) => ({
    name: a.name,
    value: a.value,
    country: a.country || 'Global',
    titles: a.titles || []
  }));

  const totalRegionalTitles = regionalData.reduce((acc, curr) => acc + curr.count, 0) || 1;

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* 1. Top Directors (Horizontal Bar) */}
      <div className="col-span-12 lg:col-span-4 glass-card-executive p-5 flex flex-col justify-between h-[380px] rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-primary">
                <UserCheck size={15} />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Most Prolific Filmmakers
              </h3>
            </div>
            <p className="text-[11px] text-textSecondary mt-0.5">
              Click director bar to cross-filter
            </p>
          </div>
          {filters.director ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-red-300 border border-primary/40 flex items-center gap-1 truncate max-w-[130px]">
              <Check size={10} /> {filters.director}
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-red-300 border border-primary/30">
              Top Talent
            </span>
          )}
        </div>

        {/* Bar Chart */}
        <div className="flex-1 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={directorData} 
              layout="vertical" 
              margin={{ top: 5, right: 20, left: 35, bottom: 5 }}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  toggleFilter('director', e.activePayload[0].payload.fullName);
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
                width={75}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="count" fill="#E50914" radius={[0, 6, 6, 0]}>
                {directorData.map((entry, index) => {
                  const isSelected = filters.director === entry.fullName;
                  const isDimmed = filters.director && !isSelected;
                  return (
                    <Cell 
                      key={`dir-${index}`} 
                      fill="#E50914" 
                      fillOpacity={isDimmed ? 0.35 : 1}
                      stroke={isSelected ? '#FFFFFF' : 'none'}
                      strokeWidth={isSelected ? 2 : 0}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-textSecondary">
          <span>{filters.director ? `Filtered by ${filters.director}` : 'Rajiv Chilaka (19) · Jan Suter (18)'}</span>
          <span className="text-primary font-semibold">Click bar to drill</span>
        </div>
      </div>

      {/* 2. Key Talent Network (Treemap) */}
      <div className="col-span-12 lg:col-span-4 glass-card-executive p-5 flex flex-col justify-between h-[380px] rounded-2xl relative">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Users size={15} />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Key Talent Network
              </h3>
            </div>
            <p className="text-[11px] text-textSecondary mt-0.5">
              Click actor tile to cross-filter
            </p>
          </div>
          {filters.actor ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1 truncate max-w-[130px]">
              <Check size={10} /> {filters.actor}
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono">
              Top 12 Talent
            </span>
          )}
        </div>

        {/* Treemap Container */}
        <div className="flex-1 w-full my-1 relative">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={actorTreeData}
              dataKey="value"
              stroke="#0F172A"
              content={(props) => (
                <TreemapTile 
                  {...props} 
                  onSelectActor={(act) => toggleFilter('actor', act)}
                  selectedActor={filters.actor}
                  onHoverTile={setHoveredActor}
                />
              )}
            />
          </ResponsiveContainer>

          {/* Floating Treemap Tooltip */}
          {hoveredActor && (
            <div className="absolute top-2 left-2 z-30 pointer-events-none animate-fade-in">
              <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-2.5 shadow-2xl backdrop-blur-md text-xs w-48">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1.5">
                  <span className="font-bold text-white text-xs truncate max-w-[120px]">{hoveredActor.name}</span>
                  <span className="text-[9px] font-semibold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                    {hoveredActor.country}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>Catalog Volume:</span>
                  <span className="font-bold text-white">{hoveredActor.value} titles</span>
                </div>
                <p className="text-[9px] text-slate-400 mt-1.5 pt-1 border-t border-slate-800/80 text-center">
                  Click tile to filter dashboard
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-textSecondary">
          <span>{filters.actor ? `Filtered by ${filters.actor}` : 'Anupam Kher (42) · SRK (35) · Om Puri (30)'}</span>
          <span className="text-indigo-400 font-semibold">Proportional Treemap</span>
        </div>
      </div>

      {/* 3. Language & Regional Distribution (Donut Chart) */}
      <div className="col-span-12 lg:col-span-4 glass-card-executive p-5 flex flex-col justify-between h-[380px] rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <Languages size={15} />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Regional Sourcing Hubs
              </h3>
            </div>
            <p className="text-[11px] text-textSecondary mt-0.5">
              Click slice to filter by continent
            </p>
          </div>
          {filters.region ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1">
              <Check size={10} /> {filters.region}
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
              6 Hubs
            </span>
          )}
        </div>

        {/* Enhanced Power BI Quality Regional Donut */}
        <div className="relative flex-1 flex items-center justify-center cursor-pointer">
          <ResponsiveContainer width="100%" height={205}>
            <PieChart>
              <Pie
                data={regionalData}
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={88}
                paddingAngle={3}
                dataKey="count"
                nameKey="region"
                stroke="none"
                onClick={(entry) => toggleFilter('region', entry.region)}
              >
                {(regionalData || []).map((entry, index) => {
                  const isSelected = filters.region === entry.region;
                  const isDimmed = filters.region && !isSelected;
                  return (
                    <Cell 
                      key={`reg-${index}`} 
                      fill={entry.color} 
                      fillOpacity={isDimmed ? 0.35 : 1}
                      stroke={isSelected ? '#FFFFFF' : 'none'}
                      strokeWidth={isSelected ? 2 : 0}
                      className="transition-all duration-300 hover:opacity-100"
                    />
                  );
                })}
              </Pie>
              <Tooltip 
                formatter={(val, name) => [`${val.toLocaleString()} titles (${Math.round((val / totalRegionalTitles) * 100)}%)`, name]}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '11px',
                  color: '#FFFFFF'
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Prominent Center KPI Metric */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-[10px] text-textSecondary uppercase font-bold tracking-wider">
              {filters.region || 'Continental'}
            </span>
            <span className="text-lg font-black text-white tracking-tight">
              {filters.region 
                ? (regionalData.find(r => r.region === filters.region)?.count || 0).toLocaleString()
                : totalRegionalTitles.toLocaleString()
              }
            </span>
            <span className="text-[9px] text-emerald-400 font-semibold">
              {filters.region ? 'Filtered Titles' : 'Catalog Titles'}
            </span>
          </div>
        </div>

        {/* Power BI Styled Region Pills Legend */}
        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/5 text-[9px]">
          {(regionalData || []).slice(0, 6).map(r => (
            <button
              key={r.region}
              onClick={() => toggleFilter('region', r.region)}
              className={`flex items-center gap-1.5 p-1 rounded-lg border transition-all ${
                filters.region === r.region 
                  ? 'bg-white/15 border-white/40 font-bold text-white shadow-sm' 
                  : 'bg-slate-800/40 border-transparent text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
              <span className="truncate">{r.region}</span>
              <span className="text-[8px] opacity-70 ml-auto font-mono">({r.count})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
