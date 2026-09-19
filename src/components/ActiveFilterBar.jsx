import React from 'react';
import { useDashboardFilter } from '../context/FilterContext';
import { X, RotateCcw, Filter, ChevronRight, Layers, Sparkles } from 'lucide-react';

export default function ActiveFilterBar() {
  const {
    activeFilterChips,
    clearFilter,
    toggleCountryFilter,
    clearAllFilters,
    filterBreadcrumb,
    filteredCatalog,
    totalCatalogCount,
    isFiltered
  } = useDashboardFilter();

  if (!isFiltered) return null;

  const matchPct = totalCatalogCount > 0 
    ? Math.round((filteredCatalog.length / totalCatalogCount) * 1000) / 10 
    : 0;

  const handleRemoveChip = (chip) => {
    if (chip.key.startsWith('country-')) {
      toggleCountryFilter(chip.value, true);
    } else {
      clearFilter(chip.rawKey || chip.key);
    }
  };

  return (
    <div className="p-3 rounded-2xl bg-slate-900/90 border border-primary/30 backdrop-blur-md shadow-lg shadow-black/20 animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
      {/* Left: Breadcrumbs & Active Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold pr-2 border-r border-slate-800">
          <Filter size={13} className="text-primary animate-pulse" />
          <span className="hidden md:inline">Active Cross-Filters:</span>
        </div>

        {/* Dismissible Chips */}
        {activeFilterChips.map((chip) => (
          <span
            key={chip.key}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-primary/20 text-red-200 border border-primary/40 text-xs font-semibold shadow-sm transition-all hover:border-primary"
          >
            <span className="text-[10px] uppercase font-bold text-red-400">{chip.label}:</span>
            <span className="text-white">{chip.value}</span>
            <button
              onClick={() => handleRemoveChip(chip)}
              className="p-0.5 rounded-full hover:bg-primary/40 text-red-300 hover:text-white transition-colors ml-0.5"
              title={`Remove ${chip.label} filter`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>

      {/* Right: Matches & Reset Button */}
      <div className="flex items-center gap-3 justify-between sm:justify-end text-xs">
        <div className="text-slate-300 text-[11px] font-mono">
          <span className="font-bold text-white">{filteredCatalog.length.toLocaleString()}</span> of {totalCatalogCount.toLocaleString()} ({matchPct}%)
        </div>

        <button
          onClick={clearAllFilters}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          title="Clear all cross filters and reset dashboard"
        >
          <RotateCcw size={12} />
          <span>Reset Dashboard</span>
        </button>
      </div>
    </div>
  );
}
