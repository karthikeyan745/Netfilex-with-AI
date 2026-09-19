import React, { useState } from 'react';
import { Database, Play, CheckCircle, Code2, Network, Terminal } from 'lucide-react';

export default function SchemaAndSQL() {
  const [activeQuery, setActiveQuery] = useState(0);

  const queries = [
    {
      title: "Year-over-Year Content Growth",
      description: "Computes annual addition volume and growth rate across Movies & TV Shows",
      sql: `SELECT 
  year_added, 
  COUNT(*) AS total_additions,
  ROUND(COUNT(*) * 100.0 / LAG(COUNT(*)) OVER (ORDER BY year_added) - 100, 2) AS yoy_growth_pct
FROM titles
WHERE year_added IS NOT NULL
GROUP BY year_added
ORDER BY year_added DESC;`,
      results: [
        { year_added: 2021, total_additions: 31, yoy_growth_pct: "-98.46%" },
        { year_added: 2020, total_additions: 2009, yoy_growth_pct: "-6.69%" },
        { year_added: 2019, total_additions: 2153, yoy_growth_pct: "+27.77%" },
        { year_added: 2018, total_additions: 1685, yoy_growth_pct: "+30.72%" },
        { year_added: 2017, total_additions: 1289, yoy_growth_pct: "+193.62%" },
      ]
    },
    {
      title: "Top Actor - Director Collaborations",
      description: "Identifies strategic multi-project creative partnerships for regional originals",
      sql: `SELECT 
  d.director, 
  c.actor, 
  COUNT(DISTINCT d.show_id) AS collaboration_count
FROM title_directors d
JOIN title_cast c ON d.show_id = c.show_id
WHERE d.director != 'Unknown Director' AND c.actor != 'Unknown Cast'
GROUP BY d.director, c.actor
HAVING COUNT(DISTINCT d.show_id) >= 3
ORDER BY collaboration_count DESC;`,
      results: [
        { director: "S.S. Rajamouli", actor: "Prabhas", collaboration_count: 7 },
        { director: "Anurag Kashyap", actor: "Nawazuddin Siddiqui", collaboration_count: 5 },
        { director: "Youssef Chahine", actor: "Yousra", collaboration_count: 5 },
        { director: "David Dhawan", actor: "Anupam Kher", collaboration_count: 4 },
        { director: "McG", actor: "Robbie Amell", collaboration_count: 3 },
      ]
    },
    {
      title: "Genre Concentration Analysis",
      description: "Evaluates production density across top catalog classifications",
      sql: `SELECT 
  g.genre, 
  COUNT(DISTINCT g.show_id) AS title_count,
  ROUND(COUNT(DISTINCT g.show_id) * 100.0 / (SELECT COUNT(*) FROM titles), 2) AS catalog_pct
FROM title_genres g
GROUP BY g.genre
ORDER BY title_count DESC
LIMIT 10;`,
      results: [
        { genre: "International Movies", title_count: 2435, catalog_pct: "31.31%" },
        { genre: "Dramas", title_count: 2106, catalog_pct: "27.08%" },
        { genre: "Comedies", title_count: 1471, catalog_pct: "18.91%" },
        { genre: "International TV Shows", title_count: 1198, catalog_pct: "15.40%" },
        { genre: "Documentaries", title_count: 786, catalog_pct: "10.11%" },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* 3NF Normalized Schema Visual */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-400" /> Relational Database Schema (3NF-like)
            </h3>
            <p className="text-xs text-zinc-400">SQLite normalized database (`netflix.db`) separating multi-valued comma strings</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            5 Normalized Tables
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {/* Main Titles table */}
          <div className="bg-zinc-900/90 p-4 rounded-xl border border-red-500/40 md:col-span-1 shadow-lg shadow-red-950/20">
            <div className="flex items-center gap-2 border-b border-red-500/30 pb-2 mb-2">
              <Database className="w-4 h-4 text-red-500" />
              <span className="font-extrabold text-xs text-white uppercase tracking-wider">titles (PK)</span>
            </div>
            <ul className="text-[11px] space-y-1 font-mono text-zinc-300">
              <li className="text-red-400 font-bold">show_id (PK)</li>
              <li>type</li>
              <li>title</li>
              <li>date_added</li>
              <li>release_year</li>
              <li>rating</li>
              <li>duration_num</li>
              <li>year_added</li>
            </ul>
          </div>

          {/* Related normalized entities */}
          {[
            { name: "title_directors", key: "director", color: "border-blue-500/30 text-blue-400" },
            { name: "title_cast", key: "actor", color: "border-purple-500/30 text-purple-400" },
            { name: "title_genres", key: "genre", color: "border-emerald-500/30 text-emerald-400" },
            { name: "title_countries", key: "country", color: "border-amber-500/30 text-amber-400" },
          ].map((tbl, i) => (
            <div key={i} className={`bg-zinc-900/90 p-4 rounded-xl border ${tbl.color}`}>
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 mb-2">
                <span className="font-bold text-xs text-white uppercase tracking-wider">{tbl.name}</span>
              </div>
              <ul className="text-[11px] space-y-1 font-mono text-zinc-300">
                <li className="text-zinc-400">show_id (FK)</li>
                <li className="font-bold text-white">{tbl.key} (PK)</li>
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* SQL Query Runner & Execution Output */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-red-500" /> Analytics SQL Query Runner (`sql_results.txt`)
            </h3>
            <p className="text-xs text-zinc-400">Executed queries on `netflix.db` SQLite database</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Queries Executed
          </span>
        </div>

        {/* Query selection tabs */}
        <div className="flex gap-2 border-b border-zinc-800 pb-3 mb-4">
          {queries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setActiveQuery(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeQuery === idx
                  ? 'bg-red-600 text-white shadow-md shadow-red-900/30'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {q.title}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* SQL Editor View */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3 text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-red-400" /> SQL Code
              </span>
              <span className="text-[10px] text-zinc-500">SQLite 3</span>
            </div>
            <pre className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {queries[activeQuery].sql}
            </pre>
          </div>

          {/* Execution Results View */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3 text-zinc-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Play className="w-3.5 h-3.5" /> Output Table
              </span>
              <span className="text-[10px] text-zinc-500">{queries[activeQuery].results.length} rows returned</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-[11px]">
                    {Object.keys(queries[activeQuery].results[0]).map((col) => (
                      <th key={col} className="pb-2 font-semibold capitalize">{col.replace(/_/g, ' ')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                  {queries[activeQuery].results.map((row, i) => (
                    <tr key={i} className="hover:bg-zinc-900/50">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="py-2 pr-2 text-[11px]">{val}</td>
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
