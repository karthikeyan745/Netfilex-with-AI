import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Calendar,
  Film,
  Globe,
  ChevronDown,
  FileSpreadsheet, 
  FileText, 
  SlidersHorizontal, 
  Sparkles, 
  RotateCcw,
  User,
  Settings,
  X
} from 'lucide-react';
import { useDashboardFilter } from '../context/FilterContext';

export default function TopBar({
  onExportPdf,
  onExportExcel,
  rightPanelOpen,
  setRightPanelOpen,
  activeTab,
  setActiveTab
}) {
  const { 
    filters, 
    setFilter, 
    clearAllFilters, 
    isFiltered, 
    activeFilterChips, 
    filteredCatalog 
  } = useDashboardFilter();

  const [profileOpen, setProfileOpen] = useState(false);
  const [filtersMenuOpen, setFiltersMenuOpen] = useState(false);
  
  const profileRef = useRef(null);
  const filtersMenuRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (filtersMenuRef.current && !filtersMenuRef.current.contains(event.target)) {
        setFiltersMenuOpen(false);
      }
    }
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  const years = ['All Years', '2021', '2020', '2019', '2018', '2017', '2016', '2015', 'Pre-2015'];
  const genres = [
    'All Genres', 
    'Dramas', 
    'Comedies', 
    'Action & Adventure', 
    'International Movies', 
    'Documentaries', 
    'TV Shows', 
    'Children & Family Movies', 
    'Thrillers', 
    'Romantic Movies', 
    'Horror Movies'
  ];
  const countries = [
    'All Countries', 
    'United States', 
    'India', 
    'United Kingdom', 
    'Canada', 
    'France', 
    'Japan', 
    'Spain', 
    'South Korea', 
    'Germany', 
    'Mexico'
  ];

  const collapsedActiveFiltersCount = (filters.genre ? 1 : 0) + (filters.country ? 1 : 0);

  return (
    <header 
      className="h-[70px] border-b border-borderMuted bg-card px-4 lg:px-5 flex items-center justify-between gap-4 sticky top-0 z-20 select-none flex-shrink-0 w-full" 
      style={{ backgroundColor: '#131D2F' }}
    >
      {/* ====================================================
          LEFT SECTION: Title, Live Badge, and Subtitle
          - Title and Subtitle aligned perfectly on the left
          - Subtitle starts exactly below title
          - Live badge vertically centered with title
          - Consistent spacing between title and badge
          ==================================================== */}
      <div className="flex flex-col justify-center flex-shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold text-white tracking-tight leading-none whitespace-nowrap">
            Executive Content Intelligence
          </h1>
          <span 
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border leading-none whitespace-nowrap flex-shrink-0 ${
              isFiltered 
                ? 'bg-primary/20 text-red-300 border-primary/40' 
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isFiltered ? 'bg-primary animate-ping' : 'bg-emerald-400'}`}></span>
            <span>{filteredCatalog.length.toLocaleString()} {isFiltered ? 'Filtered' : 'Live'}</span>
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 leading-none tracking-normal whitespace-nowrap">
          Power BI Interactive Engine & Cross-Filtering
        </p>
      </div>

      {/* ====================================================
          CENTER SECTION: Search, Year, Genre, Country
          - Search height = Dropdown height (40px / h-10)
          - Equal widths across slicers
          - Equal border radius (rounded-xl)
          - Equal padding (pl-9 pr-7)
          - Equal icon alignment (left-3 for leading, right-2.5 for chevrons)
          - Equal text alignment (text-xs truncate)
          - Equal spacing (16px / gap-4)
          - Responsive: collapses into overflow menu when space is restricted
          ==================================================== */}
      <div className="flex items-center justify-center gap-3.5 2xl:gap-4 flex-shrink min-w-0">
        {/* 1. Global Search Slicer */}
        <div className="relative w-[118px] xl:w-[128px] 2xl:w-[140px] h-10 flex items-center flex-shrink-0">
          <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            placeholder="Search..."
            className="w-full h-10 pl-9 pr-7 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all truncate"
            title="Global Search Titles, Cast..."
          />
          {filters.search && (
            <button 
              type="button"
              onClick={() => setFilter('search', '')} 
              className="absolute right-2.5 text-slate-400 hover:text-white p-0.5 rounded-full"
              title="Clear Search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* 2. Release Year Dropdown Slicer */}
        <div className="relative w-[118px] xl:w-[128px] 2xl:w-[140px] h-10 flex items-center flex-shrink-0">
          <Calendar size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
          <select
            value={filters.year || 'All Years'}
            onChange={(e) => setFilter('year', e.target.value === 'All Years' ? null : e.target.value)}
            className={`w-full h-10 pl-9 pr-7 text-xs rounded-xl appearance-none cursor-pointer border transition-all truncate focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${
              filters.year 
                ? 'bg-primary/20 text-white border-primary/60 font-semibold' 
                : 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:border-slate-600'
            }`}
            title="Filter by Release Year"
          >
            {years.map(y => (
              <option key={y} value={y} className="bg-slate-900 text-slate-200">
                {y}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 text-slate-400 pointer-events-none" />
        </div>

        {/* 3. Genre Dropdown Slicer (Visible on 2xl screens side-by-side with equal width) */}
        <div className="relative hidden 2xl:flex w-[140px] h-10 items-center flex-shrink-0">
          <Film size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
          <select
            value={filters.genre || 'All Genres'}
            onChange={(e) => setFilter('genre', e.target.value === 'All Genres' ? null : e.target.value)}
            className={`w-full h-10 pl-9 pr-7 text-xs rounded-xl appearance-none cursor-pointer border transition-all truncate focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${
              filters.genre 
                ? 'bg-primary/20 text-white border-primary/60 font-semibold' 
                : 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:border-slate-600'
            }`}
            title="Filter by Genre"
          >
            {genres.map(g => (
              <option key={g} value={g} className="bg-slate-900 text-slate-200">
                {g}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 text-slate-400 pointer-events-none" />
        </div>

        {/* 4. Country Dropdown Slicer (Visible on 2xl screens side-by-side with equal width) */}
        <div className="relative hidden 2xl:flex w-[140px] h-10 items-center flex-shrink-0">
          <Globe size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
          <select
            value={filters.country || 'All Countries'}
            onChange={(e) => setFilter('country', e.target.value === 'All Countries' ? null : e.target.value)}
            className={`w-full h-10 pl-9 pr-7 text-xs rounded-xl appearance-none cursor-pointer border transition-all truncate focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${
              filters.country 
                ? 'bg-primary/20 text-white border-primary/60 font-semibold' 
                : 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:border-slate-600'
            }`}
            title="Filter by Country"
          >
            {countries.map(c => (
              <option key={c} value={c} className="bg-slate-900 text-slate-200">
                {c}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 text-slate-400 pointer-events-none" />
        </div>

        {/* 5. Responsive Overflow Filters Button (Visible on screens < 2xl) */}
        <div className="relative 2xl:hidden" ref={filtersMenuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFiltersMenuOpen(prev => !prev);
            }}
            className={`h-10 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all flex-shrink-0 shadow-sm ${
              collapsedActiveFiltersCount > 0
                ? 'bg-primary/20 text-white border-primary/60'
                : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:border-slate-600'
            }`}
            title="Additional Filters (Genre, Country)"
          >
            <SlidersHorizontal size={14} className={collapsedActiveFiltersCount > 0 ? 'text-primary' : 'text-slate-400'} />
            <span>Filters</span>
            {collapsedActiveFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {collapsedActiveFiltersCount}
              </span>
            )}
          </button>

          {filtersMenuOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 top-[48px] w-64 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-3.5 z-50 animate-fade-in space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <SlidersHorizontal size={13} className="text-primary" /> Filter Dimensions
                </span>
                <button 
                  type="button"
                  onClick={() => setFiltersMenuOpen(false)}
                  className="text-slate-400 hover:text-white p-0.5"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Genre Selector */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <Film size={11} /> Content Genre
                </label>
                <select
                  value={filters.genre || 'All Genres'}
                  onChange={(e) => setFilter('genre', e.target.value === 'All Genres' ? null : e.target.value)}
                  className="w-full h-9 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-primary"
                >
                  {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {/* Country Selector */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <Globe size={11} /> Production Country
                </label>
                <select
                  value={filters.country || 'All Countries'}
                  onChange={(e) => setFilter('country', e.target.value === 'All Countries' ? null : e.target.value)}
                  className="w-full h-9 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-primary"
                >
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 6. Reset Filters Button (Appears when filters applied, matching h-10 and rounded-xl) */}
        {isFiltered && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="h-10 px-2.5 text-red-400 hover:text-white bg-primary/20 hover:bg-primary/40 rounded-xl border border-primary/40 transition-all flex items-center justify-center gap-1 shadow-sm flex-shrink-0"
            title="Reset All Active Filters"
          >
            <RotateCcw size={13} />
            <span className="text-xs font-semibold">Reset</span>
          </button>
        )}
      </div>

      {/* ====================================================
          RIGHT SECTION: Excel, PDF, Settings, Profile
          - All buttons same height (40px / h-10)
          - All buttons same width style (px-3 rounded-xl, gap-1.5)
          - Icons centered
          - Text vertically centered
          - Equal spacing (gap-2.5)
          - Settings icon fully visible
          - Nothing touches screen edge
          ==================================================== */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {/* 1. Export Excel Button */}
        <button
          type="button"
          onClick={onExportExcel}
          className="h-10 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 hover:border-emerald-500/50 transition-all flex items-center justify-center gap-1.5 flex-shrink-0 shadow-sm"
          title="Export Filtered Catalog to Excel (.xlsx)"
        >
          <FileSpreadsheet size={15} className="text-emerald-400 flex-shrink-0" />
          <span>Excel</span>
        </button>

        {/* 2. Export PDF Button */}
        <button
          type="button"
          onClick={onExportPdf}
          className="h-10 px-3 rounded-xl bg-primary/20 hover:bg-primary/30 text-red-300 text-xs font-semibold border border-primary/40 hover:border-primary/60 transition-all flex items-center justify-center gap-1.5 flex-shrink-0 shadow-sm"
          title="Download Executive PDF Briefing"
        >
          <FileText size={15} className="text-primary flex-shrink-0" />
          <span>PDF</span>
        </button>

        {/* 3. Settings Button */}
        <button
          type="button"
          onClick={() => setActiveTab && setActiveTab(activeTab === 'settings' ? 'dashboard' : 'settings')}
          className={`h-10 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 flex-shrink-0 shadow-sm ${
            activeTab === 'settings'
              ? 'bg-primary/20 text-white border-primary/60 shadow-primary/20'
              : 'bg-slate-800/90 text-slate-200 border-slate-700/80 hover:bg-slate-700/90 hover:border-slate-600'
          }`}
          title="Executive BI Configuration & Settings"
        >
          <Settings size={15} className="text-slate-300 flex-shrink-0" />
          <span>Settings</span>
        </button>

        {/* 4. Profile Button with Dropdown */}
        <div className="relative flex items-center" ref={profileRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setProfileOpen(prev => !prev);
            }}
            className={`h-10 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 flex-shrink-0 shadow-sm ${
              profileOpen
                ? 'bg-secondary/20 text-indigo-200 border-secondary/50 shadow-secondary/20'
                : 'bg-slate-800/90 text-slate-200 border-slate-700/80 hover:bg-slate-700/90 hover:border-slate-600'
            }`}
            title="Executive BI Profile & Telemetry"
          >
            <User size={15} className="text-slate-300 flex-shrink-0" />
            <span>Profile</span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-[48px] w-64 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-3.5 z-50 animate-fade-in text-xs">
              <div className="px-3 py-2 border-b border-slate-800/80 mb-2">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-black text-xs">
                    BI
                  </div>
                  <div>
                    <p className="font-bold text-white tracking-wide">Executive BI Portal</p>
                    <p className="text-[10px] text-slate-400">admin@netflix-analytics.internal</p>
                  </div>
                </div>
              </div>

              <div className="py-1 space-y-1">
                {/* Engine Telemetry */}
                <div className="px-3 py-2 text-slate-300 flex items-center justify-between hover:bg-slate-800/70 rounded-xl transition-colors">
                  <span className="text-slate-400 font-medium">Engine Telemetry</span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Power BI Sync
                  </span>
                </div>

                {/* Active Slices Indicator */}
                <div className="px-3 py-2 text-slate-300 flex items-center justify-between hover:bg-slate-800/70 rounded-xl transition-colors">
                  <span className="text-slate-400 font-medium">Active Slices</span>
                  <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    {activeFilterChips.length} Dimensions
                  </span>
                </div>

                {/* AI Strategic Advisory Drawer Toggle */}
                <div 
                  onClick={() => {
                    if (setRightPanelOpen) setRightPanelOpen(!rightPanelOpen);
                  }}
                  className="px-3 py-2 text-slate-300 flex items-center justify-between hover:bg-slate-800/70 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-secondary" />
                    <span>AI Advisory Drawer</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    rightPanelOpen 
                      ? 'bg-secondary/20 text-indigo-300 border-secondary/40' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {rightPanelOpen ? 'Active' : 'Closed'}
                  </span>
                </div>

                {/* System Settings Navigation */}
                <div 
                  onClick={() => {
                    if (setActiveTab) setActiveTab('settings');
                    setProfileOpen(false);
                  }}
                  className="px-3 py-2 text-slate-300 flex items-center justify-between hover:bg-slate-800/70 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Settings size={14} className="text-slate-400" />
                    <span>System Settings</span>
                  </div>
                  <span className="text-[10px] text-slate-400">View</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 mt-1">
                <button 
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  className="w-full text-center px-3 py-1.5 text-red-400 hover:bg-red-500/10 rounded-xl font-semibold transition-colors text-[11px]"
                >
                  Close Menu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
