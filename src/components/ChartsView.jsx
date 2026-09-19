import React, { useState } from 'react';
import { BarChart2, TrendingUp, Calendar, Globe, Award, AlertCircle } from 'lucide-react';
import summaryStats from '../data/summaryStats.json';

export default function ChartsView() {
  const yearlyData = Object.entries(summaryStats.yearly_additions)
    .filter(([year]) => parseInt(year) >= 2008 && parseInt(year) <= 2021)
    .map(([year, count]) => ({ year, count }));

  const maxYearly = Math.max(...yearlyData.map(d => d.count));

  const countryData = Object.entries(summaryStats.top_countries).map(([country, count]) => ({ country, count }));
  const maxCountry = Math.max(...countryData.map(d => d.count));

  const ratingData = Object.entries(summaryStats.rating_dist).map(([rating, count]) => ({ rating, count }));
  const maxRating = Math.max(...ratingData.map(d => d.count));

  const monthlyOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthlyData = monthlyOrder.map(month => ({
    month: month.substring(0, 3),
    fullName: month,
    count: summaryStats.monthly_dist[month] || 0
  }));
  const maxMonthly = Math.max(...monthlyData.map(d => d.count));

  const seasonBreakdown = [
    { label: "1 Season (Cancelled/Single)", pct: 66.8, count: 1603, color: "bg-red-500" },
    { label: "2 Seasons", pct: 17.5, count: 420, color: "bg-amber-500" },
    { label: "3 Seasons", pct: 8.2, count: 197, color: "bg-emerald-500" },
    { label: "4+ Seasons", pct: 7.5, count: 180, color: "bg-blue-500" }
  ];

  return (
    <div className="space-y-6">
      {/* Row 1: Additions Over Time & Country Sourcing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Curve */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-500" /> Catalog Growth & Additions (2008–2021)
              </h3>
              <p className="text-xs text-zinc-400">Peak additions in 2019 (2,153 titles) & COVID-19 pandemic dip in 2020</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              Peak: 2019
            </span>
          </div>

          <div className="h-56 flex items-end justify-between gap-1.5 pt-6 border-b border-zinc-800 pb-2">
            {yearlyData.map(({ year, count }) => {
              const heightPct = Math.round((count / maxYearly) * 100);
              return (
                <div key={year} className="flex-1 flex flex-col items-center group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-[10px] py-1 px-2 rounded border border-zinc-700 whitespace-nowrap z-10 shadow-lg pointer-events-none">
                    {year}: {count} titles
                  </div>
                  <div className="w-full flex justify-center items-end h-full">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-[20px] rounded-t transition-all duration-500 group-hover:brightness-125 ${
                        year === '2019' ? 'bg-gradient-to-t from-red-700 to-red-500 shadow-lg shadow-red-900/50' : 'bg-zinc-700/80 group-hover:bg-red-500/80'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 group-hover:text-zinc-200 mt-2 font-mono">{year.slice(2)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Country Sourcing */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" /> Sourcing Volume by Country
              </h3>
              <p className="text-xs text-zinc-400">Leading content production hubs across global markets</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              US & India Dominate
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {countryData.map(({ country, count }) => {
              const widthPct = Math.round((count / maxCountry) * 100);
              return (
                <div key={country} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-300">{country}</span>
                    <span className="text-zinc-400 font-mono">{count.toLocaleString()} titles</span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-800/80 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${widthPct}%` }}
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Seasonal Trends, Rating Distribution & Season Cancellation Slope */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Seasonal Spikes */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" /> Monthly Release Trends
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Nov-Dec Peak
            </span>
          </div>
          <p className="text-xs text-zinc-400 mb-4">Content additions spike during Q4 holiday retention periods</p>

          <div className="grid grid-cols-4 gap-2 pt-2">
            {monthlyData.map(({ month, fullName, count }) => (
              <div key={month} className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 flex flex-col items-center">
                <span className="text-[11px] font-semibold text-zinc-400">{month}</span>
                <span className="text-base font-extrabold text-white mt-0.5 font-mono">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Rating Focus */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" /> Maturity Rating Focus
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
              61.5% TV-MA & TV-14
            </span>
          </div>
          <p className="text-xs text-zinc-400 mb-4">Strong bias towards adult & teenage demographics</p>

          <div className="space-y-2.5">
            {ratingData.map(({ rating, count }) => {
              const widthPct = Math.round((count / maxRating) * 100);
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="w-14 text-xs font-semibold text-zinc-300 font-mono">{rating}</span>
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${widthPct}%` }}
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    />
                  </div>
                  <span className="text-xs text-zinc-400 font-mono w-10 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* TV Show Cancellation Risk */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" /> TV Show Season Cancellation
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              66.8% Cancelled S1
            </span>
          </div>
          <p className="text-xs text-zinc-400 mb-4">High drop-off after Season 1 indicates significant capital waste</p>

          <div className="space-y-4 pt-1">
            {seasonBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-zinc-200">{item.label}</span>
                  <span className="font-mono text-zinc-400">{item.pct}% ({item.count})</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div style={{ width: `${item.pct}%` }} className={`h-full ${item.color} rounded-full`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
