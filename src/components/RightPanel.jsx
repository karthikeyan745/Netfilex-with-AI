import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Target, 
  ShieldAlert, 
  X, 
  Activity,
  ArrowRight,
  Zap,
  Flame,
  Filter
} from 'lucide-react';
import { useDashboardFilter } from '../context/FilterContext';

export default function RightPanel({ isOpen, onClose }) {
  const { computedAnalytics, isFiltered, filterBreadcrumb, filteredCatalog } = useDashboardFilter();

  if (!isOpen) return null;

  const insights = computedAnalytics?.executiveInsights || {};
  const healthScore = insights.healthScore || 88;
  const metrics = insights.metrics || {
    freshness: 91,
    globalDiversity: 84,
    retentionStability: 67,
    licensingEfficiency: 89
  };

  const recommendations = insights.recommendations || [];
  const risks = insights.risks || [];

  return (
    <aside 
      className="w-80 xl:w-96 border-l border-borderMuted bg-card flex flex-col h-full z-20 overflow-y-auto select-none"
      style={{ backgroundColor: '#131D2F' }}
    >
      {/* Top Header */}
      <div className="p-4 border-b border-borderMuted flex items-center justify-between sticky top-0 bg-[#131D2F] z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-secondary/15 text-secondary border border-secondary/30">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              Executive AI Advisory
            </h2>
            <p className="text-[10px] text-textSecondary">
              {isFiltered ? 'Active Slice Assessment' : 'Global Portfolio Health'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl border border-slate-700 transition-colors"
          title="Close Panel"
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Slice Context Alert if Filtered */}
        {isFiltered && (
          <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/30 text-xs">
            <p className="text-red-300 font-bold flex items-center gap-1.5 text-[11px]">
              <Filter size={12} /> Filtered Portfolio Assessment
            </p>
            <p className="text-slate-300 text-[10px] mt-0.5 truncate">
              {filterBreadcrumb} ({filteredCatalog.length.toLocaleString()} titles)
            </p>
          </div>
        )}

        {/* 1. Catalog Health Score Gauge */}
        <div className="glass-card-executive p-4 bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Activity size={14} className="text-emerald-400" /> Catalog Health Index
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
              {healthScore >= 80 ? 'Grade A · Robust' : 'Grade B · Balanced'}
            </span>
          </div>

          {/* Large Radial Score */}
          <div className="flex items-center justify-between gap-4 py-2">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={healthScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}
                  strokeDasharray={`${healthScore}, 100`}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-white">{healthScore}</span>
                <span className="text-[8px] text-slate-400 uppercase font-semibold">/ 100</span>
              </div>
            </div>

            {/* Sub-metric progress bars */}
            <div className="flex-1 space-y-1.5 text-[10px]">
              <div>
                <div className="flex justify-between text-slate-300 mb-0.5">
                  <span>Freshness Rate</span>
                  <span className="font-bold text-white">{metrics.freshness}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full" style={{ width: `${metrics.freshness}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-0.5">
                  <span>Global Diversity</span>
                  <span className="font-bold text-white">{metrics.globalDiversity}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-sky-400 h-full" style={{ width: `${metrics.globalDiversity}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-0.5">
                  <span>Retention Stability</span>
                  <span className="font-bold text-red-400">{metrics.retentionStability}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-red-400 h-full" style={{ width: `${metrics.retentionStability}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Business Recommendations (Actionable Strategy) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Target size={14} className="text-primary" /> Strategic Directives
            </h3>
            <span className="text-[10px] text-slate-400">{recommendations.length} Active</span>
          </div>

          <div className="space-y-2.5">
            {recommendations.map((rec) => (
              <div 
                key={rec.id}
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                    rec.priority === 'High' 
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {rec.priority} Priority
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">
                    {rec.impact}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white mb-1 group-hover:text-primary transition-colors">
                  {rec.title}
                </h4>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {rec.description}
                </p>

                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-medium text-slate-400">Focus: {rec.tag}</span>
                  <span className="text-primary flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform font-semibold">
                    Simulate ROI <ArrowRight size={10} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Risk Analysis */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-amber-400" /> Portfolio Risk Exposure
            </h3>
          </div>

          <div className="space-y-2">
            {risks.map((risk, idx) => (
              <div 
                key={idx}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex gap-2.5"
              >
                <div className="pt-0.5">
                  <AlertTriangle 
                    size={14} 
                    className={risk.type.includes('High') ? 'text-red-400' : 'text-amber-400'} 
                  />
                </div>
                <div>
                  <p className="font-bold text-white text-[11px]">{risk.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{risk.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Growth Opportunities summary */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/50 to-slate-900 border border-indigo-500/20 text-xs">
          <div className="flex items-center gap-2 text-indigo-300 font-bold mb-1.5">
            <Zap size={14} /> Immediate Growth Lever
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Expanding Spanish & Korean drama co-productions delivers a 2.4x lifetime viewer value vs domestic US feature film acquisitions.
          </p>
        </div>
      </div>
    </aside>
  );
}
