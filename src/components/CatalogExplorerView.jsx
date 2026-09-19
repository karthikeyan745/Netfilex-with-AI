import React from 'react';
import DataTableSection from './DataTableSection';
import { Compass, Sparkles, Filter, Database } from 'lucide-react';

export default function CatalogExplorerView({ catalog = [] }) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-card-executive p-6 bg-gradient-to-r from-card via-[#1A263B] to-card border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-red-300 border border-primary/30 uppercase tracking-wider">
              Catalog Master Grid
            </span>
            <span className="text-xs text-slate-400">7,777 Cleaned Records</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Global Content Catalog & Asset Master
          </h2>
          <p className="text-xs text-textSecondary mt-1 max-w-2xl">
            High-performance, searchable inventory of Netflix movies, series, directors, casts, duration, ratings, and localized regional assets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <span className="text-slate-400">Memory Index:</span>{' '}
            <span className="text-emerald-400 font-bold">100% In-Memory</span>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <DataTableSection catalog={catalog} />
    </div>
  );
}
