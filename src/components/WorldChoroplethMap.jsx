import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import * as topojson from 'topojson-client';
import { geoPath, geoNaturalEarth1 } from 'd3-geo';
import worldTopo from 'world-atlas/countries-110m.json';
import { 
  Plus, 
  Minus, 
  RotateCcw, 
  Layers, 
  Check, 
  Film, 
  Award, 
  Globe 
} from 'lucide-react';
import { useDashboardFilter } from '../context/FilterContext';
import { COUNTRY_FLAGS, COUNTRY_ISO } from '../data/countryMeta';

// Color scale buckets for choropleth
const COLOR_SCALE = [
  { min: 501, max: Infinity, color: '#E50914', label: '500+' },
  { min: 201, max: 500, color: '#EA580C', label: '201-500' },
  { min: 51, max: 200, color: '#0284C7', label: '51-200' },
  { min: 11, max: 50, color: '#2563EB', label: '11-50' },
  { min: 1, max: 10, color: '#1E3A8A', label: '1-10' },
  { min: 0, max: 0, color: '#1E293B', label: '0' }
];

function getCountryColor(count, isSelected) {
  if (isSelected) return '#E50914';
  if (!count || count === 0) return '#1E293B';
  if (count > 500) return '#E50914';
  if (count > 200) return '#EA580C';
  if (count > 50) return '#0284C7';
  if (count > 10) return '#2563EB';
  return '#1E3A8A';
}

// Precompute GeoJSON features and SVG paths ONCE at module load (never inside component render loop)
const PRECOMPUTED_FEATURES = (() => {
  const geo = topojson.feature(worldTopo, worldTopo.objects.countries);
  const projection = geoNaturalEarth1().scale(155).translate([480, 260]);
  const pathGenerator = geoPath().projection(projection);

  return geo.features.map(f => {
    const geoName = f.properties.name || '';
    let netflixName = geoName;
    if (geoName === 'United States of America') netflixName = 'United States';
    else if (geoName === 'Czechia') netflixName = 'Czech Republic';
    else if (geoName === 'Dominican Rep.') netflixName = 'Dominican Republic';
    else if (geoName === 'Russian Federation') netflixName = 'Russia';

    return {
      id: f.id,
      name: netflixName,
      geoName,
      d: pathGenerator(f)
    };
  }).filter(f => Boolean(f.d));
})();

export default function WorldChoroplethMap() {
  const { 
    computedAnalytics, 
    toggleCountryFilter, 
    selectedCountries 
  } = useDashboardFilter();

  const containerRef = useRef(null);

  // Pan & Zoom state
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Hover and Tooltip state
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 10, y: 10 });

  // Multi-select toggle mode (or via Ctrl+Click)
  const [multiSelectMode, setMultiSelectMode] = useState(false);

  // All countries stats dictionary
  const allStats = computedAnalytics?.allCountryStats || {};

  // Pan handlers with window mouse events for smooth dragging
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  }, [transform.x, transform.y]);

  useEffect(() => {
    if (!isDragging) return;

    const handleWindowMouseMove = (e) => {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      }));
    };

    const handleWindowMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDragging]);

  // Wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    setTransform(prev => {
      const newK = Math.min(5.5, Math.max(0.85, prev.k * zoomFactor));
      return {
        ...prev,
        k: newK
      };
    });
  }, []);

  // Zoom control buttons
  const zoomIn = () => setTransform(prev => ({ ...prev, k: Math.min(5.5, prev.k * 1.25) }));
  const zoomOut = () => setTransform(prev => ({ ...prev, k: Math.max(0.85, prev.k / 1.25) }));
  const resetZoom = () => setTransform({ x: 0, y: 0, k: 1 });

  // Country click handler
  const handleCountryClick = (cName, e) => {
    if (!cName) return;
    const isMulti = multiSelectMode || (e && (e.ctrlKey || e.metaKey || e.shiftKey));
    toggleCountryFilter(cName, isMulti);
  };

  // Hover position update (only on country enter)
  const handleCountryMouseEnter = (f, e) => {
    setHoveredCountry(f);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;
      const clampedX = Math.min(rect.width - 240, Math.max(10, rawX + 15));
      const clampedY = Math.min(rect.height - 180, Math.max(10, rawY - 20));
      setTooltipPos({ x: clampedX, y: clampedY });
    }
  };

  // Top country chips
  const topCountryChips = [
    { label: 'USA', value: 'United States', flag: '🇺🇸' },
    { label: 'India', value: 'India', flag: '🇮🇳' },
    { label: 'UK', value: 'United Kingdom', flag: '🇬🇧' },
    { label: 'Japan', value: 'Japan', flag: '🇯🇵' },
    { label: 'South Korea', value: 'South Korea', flag: '🇰🇷' },
    { label: 'Canada', value: 'Canada', flag: '🇨🇦' }
  ];

  // Hovered country stats lookup
  const hoveredStats = useMemo(() => {
    if (!hoveredCountry) return null;
    const stats = allStats[hoveredCountry.name] || allStats[hoveredCountry.geoName];
    if (stats) return stats;
    return {
      country: hoveredCountry.name,
      count: 0,
      movies: 0,
      tvShows: 0,
      topGenre: 'N/A',
      avgRating: 'N/A',
      iso: COUNTRY_ISO[hoveredCountry.name] || hoveredCountry.name.substring(0, 3).toUpperCase(),
      flag: COUNTRY_FLAGS[hoveredCountry.name] || '🌐',
      share: 0
    };
  }, [hoveredCountry, allStats]);

  const hasSelectedCountries = selectedCountries.length > 0;

  return (
    <div 
      ref={containerRef}
      className="relative flex-1 flex flex-col justify-between overflow-hidden select-none"
      onMouseLeave={() => setHoveredCountry(null)}
    >
      {/* Map Interactive Canvas */}
      <div 
        className="relative flex-1 w-full h-full min-h-[220px] rounded-xl bg-slate-950/70 border border-slate-800/80 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        <svg
          viewBox="0 0 960 500"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Subtle ocean grid lines */}
          <defs>
            <pattern id="oceanGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
            </pattern>
            <filter id="countryGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#E50914" floodOpacity="0.9" />
            </filter>
            <filter id="selectedGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#E50914" floodOpacity="1" />
            </filter>
          </defs>

          <rect width="960" height="500" fill="transparent" />
          <rect width="960" height="500" fill="url(#oceanGrid)" pointerEvents="none" />

          {/* Dynamic Transform Group */}
          <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
            {PRECOMPUTED_FEATURES.map((f) => {
              const stats = allStats[f.name] || allStats[f.geoName];
              const count = stats?.count || 0;
              const isSelected = selectedCountries.includes(f.name) || selectedCountries.includes(f.geoName);
              const isDimmed = hasSelectedCountries && !isSelected;
              const isHovered = hoveredCountry?.name === f.name;

              const fillColor = getCountryColor(count, isSelected);
              const strokeColor = isSelected ? '#FFFFFF' : isHovered ? '#FFFFFF' : '#334155';
              const strokeWidth = (isSelected ? 1.4 : isHovered ? 1.0 : 0.45) / transform.k;

              return (
                <path
                  key={f.id || f.name}
                  d={f.d}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={isDimmed ? 0.32 : 1}
                  filter={isSelected ? 'url(#selectedGlow)' : isHovered ? 'url(#countryGlow)' : undefined}
                  className="cursor-pointer"
                  style={{
                    transformOrigin: 'center',
                    vectorEffect: 'non-scaling-stroke'
                  }}
                  onMouseEnter={(e) => handleCountryMouseEnter(f, e)}
                  onClick={(e) => handleCountryClick(f.name, e)}
                />
              );
            })}
          </g>
        </svg>

        {/* Floating Zoom & Pan Controls Overlay */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 z-20">
          <button
            onClick={zoomIn}
            className="w-7 h-7 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white flex items-center justify-center text-xs shadow-md transition-all hover:scale-105 active:scale-95"
            title="Zoom In (+)"
          >
            <Plus size={13} />
          </button>
          <button
            onClick={zoomOut}
            className="w-7 h-7 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white flex items-center justify-center text-xs shadow-md transition-all hover:scale-105 active:scale-95"
            title="Zoom Out (-)"
          >
            <Minus size={13} />
          </button>
          <button
            onClick={resetZoom}
            className="w-7 h-7 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white flex items-center justify-center text-xs shadow-md transition-all hover:scale-105 active:scale-95"
            title="Reset Map View"
          >
            <RotateCcw size={12} />
          </button>
        </div>

        {/* Multi-Select Mode Toggle & Zoom Level Badge (Top Left) */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-20">
          <button
            onClick={() => setMultiSelectMode(!multiSelectMode)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 shadow-sm ${
              multiSelectMode
                ? 'bg-primary text-white border-primary shadow-primary/30 ring-1 ring-primary'
                : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:bg-slate-800'
            }`}
            title="Toggle Multi-Country Selection Mode (or hold CTRL while clicking)"
          >
            <Layers size={11} />
            <span>Multi-Select</span>
            {multiSelectMode && <Check size={10} />}
          </button>

          <span className="px-1.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[9px] font-mono text-slate-400">
            {Math.round(transform.k * 100)}%
          </span>
        </div>

        {/* Choropleth Legend (Bottom Left) */}
        <div className="absolute bottom-2.5 left-2.5 z-20 bg-slate-900/90 border border-slate-800/90 rounded-lg px-2 py-1 backdrop-blur-md flex items-center gap-1.5 text-[9px]">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[8px]">Volume:</span>
          <div className="flex items-center gap-1">
            {COLOR_SCALE.slice().reverse().map(b => (
              <div key={b.label} className="flex items-center gap-0.5" title={`${b.label} titles`}>
                <span className="w-2.5 h-2 rounded-sm" style={{ backgroundColor: b.color }} />
                <span className="text-slate-400 text-[8px] font-mono">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Modern Floating Hover Tooltip */}
        {hoveredCountry && hoveredStats && (
          <div
            className="absolute z-30 pointer-events-none transition-all duration-75"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`
            }}
          >
            <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3 shadow-2xl backdrop-blur-md text-xs w-56 animate-fade-in border-t-primary/60">
              {/* Header: Flag + Country Name */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">{hoveredStats.flag}</span>
                  <span className="font-bold text-white text-xs truncate max-w-[125px]">
                    {hoveredStats.country}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-primary border border-primary/20">
                  {hoveredStats.iso}
                </span>
              </div>

              {/* Metric Counts */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-slate-950/60 rounded-xl p-1.5 border border-slate-800/70">
                  <p className="text-[9px] text-slate-400 uppercase font-semibold">Total Titles</p>
                  <p className="text-sm font-black text-white">{hoveredStats.count.toLocaleString()}</p>
                  <p className="text-[8px] text-slate-400">{hoveredStats.share}% of catalog</p>
                </div>
                <div className="bg-slate-950/60 rounded-xl p-1.5 border border-slate-800/70">
                  <p className="text-[9px] text-slate-400 uppercase font-semibold">Mix</p>
                  <div className="text-[10px] font-bold text-slate-200 mt-0.5">
                    <span className="text-orange-400">{hoveredStats.movies}M</span> · <span className="text-sky-400">{hoveredStats.tvShows}TV</span>
                  </div>
                  <p className="text-[8px] text-emerald-400">
                    {hoveredStats.count > 0 ? `${Math.round((hoveredStats.movies / (hoveredStats.count || 1)) * 100)}% Movies` : 'None'}
                  </p>
                </div>
              </div>

              {/* Taxonomy Details */}
              <div className="space-y-1 text-[10px] text-slate-300 border-t border-slate-800/70 pt-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Film size={10} className="text-secondary" /> Dominant Genre:
                  </span>
                  <span className="font-semibold text-white truncate max-w-[85px]">{hoveredStats.topGenre}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Award size={10} className="text-amber-400" /> Top Maturity:
                  </span>
                  <span className="font-semibold text-amber-300">{hoveredStats.avgRating}</span>
                </div>
              </div>

              {/* Click instruction */}
              <div className="mt-2 pt-1 border-t border-slate-800/80 text-[8px] text-slate-400 text-center font-medium">
                {selectedCountries.includes(hoveredStats.country) 
                  ? 'Click to remove filter' 
                  : multiSelectMode 
                    ? 'Click to add to selection' 
                    : 'Click to filter (Ctrl+Click multi-select)'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Countries Quick Slicer Chips (Below Map) */}
      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between gap-1 flex-wrap">
        <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider flex items-center gap-1">
          <Globe size={11} className="text-emerald-400" /> Top Mkts:
        </span>
        <div className="flex items-center gap-1 flex-wrap">
          {topCountryChips.map(c => {
            const isSelected = selectedCountries.includes(c.value);
            const count = allStats[c.value]?.count || 0;
            return (
              <button
                key={c.value}
                onClick={(e) => handleCountryClick(c.value, e)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border transition-all flex items-center gap-1 shadow-sm ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-primary/30 ring-1 ring-primary font-bold'
                    : 'bg-slate-800/70 text-slate-300 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                }`}
                title={`Filter by ${c.value} (${count.toLocaleString()} titles)`}
              >
                <span>{c.flag}</span>
                <span>{c.label}</span>
                <span className="text-[9px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
