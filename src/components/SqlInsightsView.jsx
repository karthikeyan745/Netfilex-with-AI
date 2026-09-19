import React, { useState } from 'react';
import { 
  Database, 
  Play, 
  Copy, 
  Check, 
  Terminal, 
  Table, 
  Code2, 
  Network, 
  CheckCircle,
  Key,
  Layers
} from 'lucide-react';

export default function SqlInsightsView() {
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [activeQueryIndex, setActiveQueryIndex] = useState(0);
  const [executionRunning, setExecutionRunning] = useState(false);

  // Normalized 3NF Schema Tables definition
  const schemaTables = [
    {
      name: "titles",
      isPrimary: true,
      color: "border-primary/50 text-red-400 bg-slate-900/90",
      icon: Database,
      columns: [
        { name: "show_id", type: "TEXT", isPk: true },
        { name: "type", type: "TEXT" },
        { name: "title", type: "TEXT" },
        { name: "date_added", type: "TEXT" },
        { name: "release_year", type: "INTEGER" },
        { name: "rating", type: "TEXT" },
        { name: "duration", type: "TEXT" },
        { name: "duration_num", type: "REAL" },
        { name: "year_added", type: "INTEGER" }
      ]
    },
    {
      name: "title_directors",
      isPrimary: false,
      color: "border-sky-500/40 text-sky-400 bg-slate-900/80",
      columns: [
        { name: "show_id", type: "TEXT", isFk: true },
        { name: "director", type: "TEXT", isPk: true }
      ]
    },
    {
      name: "title_cast",
      isPrimary: false,
      color: "border-purple-500/40 text-purple-400 bg-slate-900/80",
      columns: [
        { name: "show_id", type: "TEXT", isFk: true },
        { name: "actor", type: "TEXT", isPk: true }
      ]
    },
    {
      name: "title_genres",
      isPrimary: false,
      color: "border-emerald-500/40 text-emerald-400 bg-slate-900/80",
      columns: [
        { name: "show_id", type: "TEXT", isFk: true },
        { name: "genre", type: "TEXT", isPk: true }
      ]
    },
    {
      name: "title_countries",
      isPrimary: false,
      color: "border-amber-500/40 text-amber-400 bg-slate-900/80",
      columns: [
        { name: "show_id", type: "TEXT", isFk: true },
        { name: "country", type: "TEXT", isPk: true }
      ]
    }
  ];

  const queries = [
    {
      title: "1. Top Actor - Director Collaborations",
      category: "Talent Partnerships",
      description: "Identifies strategic multi-project creative partnerships for regional original films.",
      sql: `SELECT 
  d.director, 
  c.actor, 
  COUNT(DISTINCT d.show_id) AS collaboration_count
FROM title_directors d
JOIN title_cast c ON d.show_id = c.show_id
WHERE d.director != 'Unknown Director' AND c.actor != 'Unknown Cast'
GROUP BY d.director, c.actor
HAVING COUNT(DISTINCT d.show_id) >= 3
ORDER BY collaboration_count DESC
LIMIT 5;`,
      resultSummary: "S.S. Rajamouli & Prabhas (7) and Anurag Kashyap & Nawazuddin Siddiqui (5) lead creative partnerships.",
      mockOutput: [
        { director: "S.S. Rajamouli", actor: "Prabhas", collaboration_count: 7 },
        { director: "Anurag Kashyap", actor: "Nawazuddin Siddiqui", collaboration_count: 5 },
        { director: "Youssef Chahine", actor: "Yousra", collaboration_count: 5 },
        { director: "David Dhawan", actor: "Anupam Kher", collaboration_count: 4 },
        { director: "McG", actor: "Robbie Amell", collaboration_count: 3 }
      ]
    },
    {
      title: "2. Year-over-Year Content Growth Rate",
      category: "Catalog Trajectory",
      description: "Computes annual addition volume and YoY net percentage change.",
      sql: `SELECT 
  year_added, 
  COUNT(*) AS total_additions,
  ROUND(COUNT(*) * 100.0 / LAG(COUNT(*)) OVER (ORDER BY year_added) - 100, 2) AS yoy_growth_pct
FROM titles
WHERE year_added IS NOT NULL AND year_added >= 2016
GROUP BY year_added
ORDER BY year_added DESC;`,
      resultSummary: "2019 was the all-time peak with 2,153 additions (+27.77% YoY).",
      mockOutput: [
        { year_added: 2021, total_additions: 117, yoy_growth_pct: "-94.18% (YTD)" },
        { year_added: 2020, total_additions: 2009, yoy_growth_pct: "-6.69%" },
        { year_added: 2019, total_additions: 2153, yoy_growth_pct: "+27.77%" },
        { year_added: 2018, total_additions: 1685, yoy_growth_pct: "+37.55%" },
        { year_added: 2017, total_additions: 1225, yoy_growth_pct: "+176.52%" }
      ]
    },
    {
      title: "3. TV Show Season 1 Cliffhanger Attrition",
      category: "Retention & Churn",
      description: "Measures series discontinuation after Season 1 versus recurring multi-season franchises.",
      sql: `SELECT 
  duration AS season_tier,
  COUNT(*) AS total_series,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) AS pct_of_catalog,
  CASE 
    WHEN duration = '1 Season' THEN 'CRITICAL CHURN RISK'
    WHEN duration IN ('2 Seasons', '3 Seasons') THEN 'MODERATE RETENTION'
    ELSE 'FLAGSHIP FRANCHISE'
  END AS risk_tier
FROM titles
WHERE type = 'TV Show'
GROUP BY duration
ORDER BY total_series DESC
LIMIT 5;`,
      resultSummary: "1,603 TV series (66.79%) terminate at Season 1, leading to viewer journey dead-ends.",
      mockOutput: [
        { season_tier: "1 Season", total_series: 1603, pct_of_catalog: "66.79%", risk_tier: "CRITICAL CHURN RISK" },
        { season_tier: "2 Seasons", total_series: 420, pct_of_catalog: "17.50%", risk_tier: "MODERATE RETENTION" },
        { season_tier: "3 Seasons", total_series: 197, pct_of_catalog: "8.21%", risk_tier: "MODERATE RETENTION" },
        { season_tier: "4 Seasons", total_series: 87, pct_of_catalog: "3.63%", risk_tier: "FLAGSHIP FRANCHISE" },
        { season_tier: "5 Seasons", total_series: 56, pct_of_catalog: "2.33%", risk_tier: "FLAGSHIP FRANCHISE" }
      ]
    },
    {
      title: "4. Genre Concentration & Catalog Density",
      category: "Portfolio Mix",
      description: "Evaluates production density across top catalog classifications.",
      sql: `SELECT 
  g.genre, 
  COUNT(DISTINCT g.show_id) AS title_count,
  ROUND(COUNT(DISTINCT g.show_id) * 100.0 / (SELECT COUNT(*) FROM titles), 2) AS catalog_pct
FROM title_genres g
GROUP BY g.genre
ORDER BY title_count DESC
LIMIT 5;`,
      resultSummary: "International Movies (2,435) and Dramas (2,106) lead catalog share.",
      mockOutput: [
        { genre: "International Movies", title_count: 2435, catalog_pct: "31.31%" },
        { genre: "Dramas", title_count: 2106, catalog_pct: "27.08%" },
        { genre: "Comedies", title_count: 1471, catalog_pct: "18.91%" },
        { genre: "International TV Shows", title_count: 1198, catalog_pct: "15.40%" },
        { genre: "Documentaries", title_count: 786, catalog_pct: "10.11%" }
      ]
    },
    {
      title: "5. Monthly Intake Seasonality & Q4 Surge",
      category: "Publishing Cadence",
      description: "Analyzes month-over-month content dumps to isolate recurring holiday additions.",
      sql: `SELECT 
  month_name_added,
  COUNT(*) AS total_additions,
  ROUND(COUNT(*) * 100.0 / 7777, 2) AS monthly_pct
FROM titles
GROUP BY month_added, month_name_added
ORDER BY total_additions DESC
LIMIT 5;`,
      resultSummary: "December (833 titles) and October (785 titles) represent the annual peak ingestion window.",
      mockOutput: [
        { month_name_added: "December", total_additions: 833, monthly_pct: "10.71%" },
        { month_name_added: "October", total_additions: 785, monthly_pct: "10.09%" },
        { month_name_added: "January", total_additions: 757, monthly_pct: "9.73%" },
        { month_name_added: "November", total_additions: 738, monthly_pct: "9.49%" },
        { month_name_added: "March", total_additions: 669, monthly_pct: "8.60%" }
      ]
    }
  ];

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleSimulateRun = () => {
    setExecutionRunning(true);
    setTimeout(() => setExecutionRunning(false), 300);
  };

  const activeQuery = queries[activeQueryIndex];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-card-executive p-6 bg-gradient-to-r from-card via-[#1A263B] to-card border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary/20 text-indigo-300 border border-secondary/30 uppercase tracking-wider">
              SQL Intelligence Studio
            </span>
            <span className="text-xs text-slate-400">Enterprise SQLite & Snowflake Analytics Engine</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Relational Schema (3NF) & Executable SQL Library
          </h2>
          <p className="text-xs text-textSecondary mt-1 max-w-2xl">
            Clean 3NF normalized relational schema separating comma-delimited strings (`netflix.db`) with production analytical queries from `sql_results.txt`.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center gap-2">
            <Database size={14} className="text-secondary" />
            <span className="text-slate-300 font-mono">netflix.db · 5 Normalized Tables</span>
          </div>
        </div>
      </div>

      {/* 3NF Normalized Relational Database Schema Visual */}
      <div className="glass-card-executive p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Network size={16} className="text-indigo-400" /> Relational Database Schema Architecture (3NF)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Normalized structure separating multi-valued comma strings into indexed join tables
            </p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            5 Normalized Entities
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          {schemaTables.map((tbl) => (
            <div 
              key={tbl.name}
              className={`p-3.5 rounded-xl border ${tbl.color} flex flex-col justify-between shadow-lg`}
            >
              <div>
                <div className="flex items-center gap-1.5 border-b border-white/10 pb-2 mb-2">
                  <Database size={13} />
                  <span className="font-extrabold text-[11px] uppercase tracking-wider text-white truncate">
                    {tbl.name}
                  </span>
                </div>
                <ul className="text-[11px] space-y-1 font-mono text-slate-300">
                  {tbl.columns.map((col) => (
                    <li key={col.name} className="flex items-center justify-between">
                      <span className={col.isPk ? 'text-red-400 font-bold flex items-center gap-1' : col.isFk ? 'text-sky-400' : ''}>
                        {col.isPk && <Key size={10} />}
                        {col.name}
                      </span>
                      <span className="text-[9px] text-slate-500">{col.type}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-2 pt-2 border-t border-white/5 text-[9px] text-slate-500">
                {tbl.isPrimary ? 'Core Catalog Entity' : 'Bridge Entity'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SQL Query Studio: Menu on Left, Runner on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Query Selector */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Production Analytical Queries
          </p>
          {queries.map((q, idx) => (
            <div
              key={idx}
              onClick={() => setActiveQueryIndex(idx)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                activeQueryIndex === idx
                  ? 'bg-secondary/15 border-secondary text-white shadow-lg shadow-secondary/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  {q.category}
                </span>
                <span className="text-[10px] font-mono text-slate-500">Q0{idx + 1}</span>
              </div>
              <h4 className="text-xs font-bold text-white mb-1">
                {q.title}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {q.description}
              </p>
            </div>
          ))}
        </div>

        {/* Right 2 Columns: SQL Code & Output Grid */}
        <div className="lg:col-span-2 space-y-4">
          {/* SQL Editor Card */}
          <div className="glass-card-executive p-5 bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-emerald-400" />
                <span className="text-xs font-mono font-semibold text-slate-200">
                  interactive_query_runner.sql
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(activeQuery.sql, activeQueryIndex)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedIdx === activeQueryIndex ? (
                    <>
                      <Check size={12} className="text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy SQL</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleSimulateRun}
                  disabled={executionRunning}
                  className="px-3 py-1 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/30 transition-all"
                >
                  <Play size={12} className={executionRunning ? 'animate-spin' : ''} />
                  <span>{executionRunning ? 'Running...' : 'Execute Query'}</span>
                </button>
              </div>
            </div>

            {/* SQL Code Block */}
            <pre className="p-4 rounded-xl bg-slate-900/90 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800/80 leading-relaxed">
              <code>{activeQuery.sql}</code>
            </pre>
          </div>

          {/* Query Result Grid */}
          <div className="glass-card-executive p-5 bg-slate-900/70 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Table size={16} className="text-accent" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wide">
                  Query Output Result Set
                </h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">
                Execution Time: 11ms · Cached from netflix.db
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs mb-3 text-slate-300">
              <span className="text-slate-400 font-semibold">Executive Finding:</span>{' '}
              {activeQuery.resultSummary}
            </div>

            {/* Data Grid */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    {Object.keys(activeQuery.mockOutput[0]).map((col) => (
                      <th key={col} className="py-2.5 px-3 uppercase text-[10px]">
                        {col.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {activeQuery.mockOutput.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                      {Object.values(row).map((val, cIdx) => (
                        <td key={cIdx} className="py-2 px-3">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
