import React from 'react';
import { Lightbulb, ShieldAlert, Target, Sparkles, TrendingUp, Users } from 'lucide-react';

export default function Recommendations() {
  const recommendations = [
    {
      title: "Address TV Show Churn Rate",
      impact: "High ROI Impact",
      metric: "66.8% Cancelled S1",
      icon: ShieldAlert,
      color: "border-red-500/40 bg-red-950/20 text-red-400",
      description: "66.8% of TV series are discontinued after Season 1. Netflix should reallocate acquisition budget towards sustaining proven Season 1 hits to maximize long-term subscriber lifetime value (LTV)."
    },
    {
      title: "Expand Family & Kids Catalog",
      impact: "Market Share Gain",
      metric: "<3% Rated G/TV-G",
      icon: Target,
      color: "border-emerald-500/40 bg-emerald-950/20 text-emerald-400",
      description: "Family content represents under 3% of the current catalog. Expanding G/TV-G rated animated & family titles will allow Netflix to directly challenge Disney+ for multi-user household subscriptions."
    },
    {
      title: "Optimize Seasonal Release Calendar",
      impact: "Engagement Retention",
      metric: "Nov-Dec Peak Spikes",
      icon: TrendingUp,
      color: "border-amber-500/40 bg-amber-950/20 text-amber-400",
      description: "Content additions are currently concentrated heavily in November and December. Smoothing out releases into Q2 and Q3 (May and August) will prevent summer subscriber drop-off."
    },
    {
      title: "Strengthen Regional Creative Partnerships",
      impact: "Capital Efficiency",
      metric: "India & US Dominance",
      icon: Users,
      color: "border-purple-500/40 bg-purple-950/20 text-purple-400",
      description: "SQL collaboration data reveals highly effective actor-director pairs (e.g., S.S. Rajamouli & Prabhas in India). Netflix should sign multi-title original deals with these proven pairs."
    }
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-400" /> Executive Strategic Recommendations
            </h3>
            <p className="text-xs text-zinc-400 mt-1">Data-driven content acquisition and scheduling strategies derived from catalog analytics</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Action Plan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec, idx) => {
            const Icon = rec.icon;
            return (
              <div key={idx} className={`p-5 rounded-2xl border ${rec.color} flex flex-col justify-between transition-all duration-300 hover:scale-[1.01]`}>
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900/90 text-zinc-300 border border-zinc-800">
                        {rec.impact}
                      </span>
                      <p className="text-xs font-mono font-bold text-white mt-1">{rec.metric}</p>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-white text-base mt-4">{rec.title}</h4>
                  <p className="text-xs text-zinc-300 mt-2 leading-relaxed">{rec.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Priority Level: <strong className="text-white">P{idx + 1}</strong></span>
                  <span className="text-red-400 font-semibold hover:underline cursor-pointer">View Data Basis &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
