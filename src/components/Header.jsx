import React from 'react';
import { Film, Tv, BarChart3, Database, Lightbulb, Search, Clapperboard } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, searchTerm, setSearchTerm }) {
  const tabs = [
    { id: 'dashboard', label: 'Executive Analytics', icon: BarChart3 },
    { id: 'catalog', label: 'Catalog Explorer', icon: Clapperboard },
    { id: 'sql', label: 'Database & SQL (3NF)', icon: Database },
    { id: 'recommendations', label: 'Strategic Insights', icon: Lightbulb },
  ];

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/40">
            <span className="font-black text-2xl tracking-tighter text-white">N</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-2">
              NETFLIX <span className="text-xs px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 font-medium">Analytics Engine</span>
            </h1>
            <p className="text-xs text-zinc-400">Catalog Optimization & Content Strategy</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 text-sm font-medium">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-900/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Global Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search titles, cast, genres..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (activeTab !== 'catalog') setActiveTab('catalog');
            }}
            className="w-full pl-9 pr-4 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
          />
        </div>
      </div>
    </header>
  );
}
