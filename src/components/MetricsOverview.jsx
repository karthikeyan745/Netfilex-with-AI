import React from 'react';
import { Film, Tv, Clock, AlertTriangle, TrendingUp, Globe, Layers, Award } from 'lucide-react';
import summaryStats from '../data/summaryStats.json';

export default function MetricsOverview() {
  const kpis = [
    {
      title: "Total Cleaned Catalog",
      value: summaryStats.total_titles.toLocaleString(),
      sub: "7,777 verified titles",
      icon: Film,
      color: "from-red-500/20 to-red-900/10 border-red-500/30 text-red-400",
      badge: "+27.8% peak 2019"
    },
    {
      title: "Movies vs TV Shows",
      value: `${summaryStats.movies_count} / ${summaryStats.tv_count}`,
      sub: "69.1% Movies | 30.9% Series",
      icon: Tv,
      color: "from-purple-500/20 to-purple-900/10 border-purple-500/30 text-purple-400",
      badge: "Movie Dominated"
    },
    {
      title: "TV Show Cancellation Slope",
      value: `${summaryStats.tv_cancel_s1}%`,
      sub: "Discontinued after Season 1",
      icon: AlertTriangle,
      color: "from-amber-500/20 to-amber-900/10 border-amber-500/30 text-amber-400",
      badge: "Critical Risk Metric"
    },
    {
      title: "Avg Movie Duration",
      value: `${summaryStats.avg_movie_duration} min`,
      sub: "Median 98m | Mode 90m",
      icon: Clock,
      color: "from-blue-500/20 to-blue-900/10 border-blue-500/30 text-blue-400",
      badge: "Standard Runtime"
    },
    {
      title: "Top Regional Sourcing",
      value: "United States",
      sub: "India (2nd), UK (3rd)",
      icon: Globe,
      color: "from-emerald-500/20 to-emerald-900/10 border-emerald-500/30 text-emerald-400",
      badge: "Multi-regional Hubs"
    },
    {
      title: "Primary Maturity Rating",
      value: "TV-MA (36.8%)",
      sub: "TV-14 (24.8%) | R (8.5%)",
      icon: Award,
      color: "from-rose-500/20 to-rose-900/10 border-rose-500/30 text-rose-400",
      badge: "Mature Focus"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className={`glass-card p-5 bg-gradient-to-br ${kpi.color} relative overflow-hidden group`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{kpi.title}</p>
                <h3 className="text-2xl lg:text-3xl font-extrabold text-white mt-1 group-hover:scale-105 transition-transform duration-300">
                  {kpi.value}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">{kpi.sub}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-700/50">
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between pt-3 border-t border-zinc-800/60">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-700/50">
                {kpi.badge}
              </span>
              <TrendingUp className="w-3.5 h-3.5 text-zinc-500 group-hover:text-red-400 transition-colors" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
