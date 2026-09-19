import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Compass, 
  Database, 
  Lightbulb,
  TrendingUp, 
  Sparkles, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  collapsed, 
  setCollapsed,
  healthScore = 88
}) {
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, badge: 'Live' },
    { id: 'content', label: 'Content Analytics', icon: BarChart3 },
    { id: 'catalog', label: 'Catalog Explorer', icon: Compass, badge: '7.8k' },
    { id: 'sql', label: 'SQL Insights', icon: Database },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb, badge: 'Strategy' },
    { id: 'predictive', label: 'Predictive Analytics', icon: TrendingUp },
    { id: 'ai', label: 'AI Insights', icon: Sparkles, badge: 'GenAI' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`relative z-30 flex flex-col border-r border-borderMuted bg-card transition-all duration-300 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
      style={{ backgroundColor: '#131D2F' }}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-borderMuted">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Official Netflix styled 'N' brand icon */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-[#8A0007] flex items-center justify-center font-black text-xl text-white shadow-lg shadow-primary/30 flex-shrink-0 tracking-tighter">
            N
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-wider text-white">NETFLIX</span>
              <span className="text-[10px] font-semibold text-accent tracking-widest uppercase">Executive BI</span>
            </div>
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700/60 transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav items list */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <div className={`px-3 pb-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? '•••' : 'Main Navigation'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative ${
                isActive 
                  ? 'bg-primary/15 text-white border-l-2 border-primary shadow-sm shadow-primary/20 font-semibold' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon 
                size={17} 
                className={`flex-shrink-0 transition-colors ${
                  isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-200'
                }`} 
              />
              
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                      item.badge === 'Live' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      item.badge === 'Strategy' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      item.badge === 'GenAI' ? 'bg-primary/20 text-red-300 border border-primary/40 animate-pulse' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Tooltip for collapsed mode */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-md shadow-xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Catalog Health Widget */}
      {!collapsed ? (
        <div className="p-3 m-3 rounded-xl bg-slate-900/90 border border-borderMuted">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Activity size={12} className="text-emerald-400" /> Catalog Health
            </span>
            <span className="font-bold text-emerald-400 text-xs">{healthScore}/100</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${healthScore}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">
            Optimal catalog diversity. S1 series cliffhanger flagged.
          </p>
        </div>
      ) : (
        <div className="py-3 flex justify-center border-t border-borderMuted">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold text-emerald-400" title={`Health: ${healthScore}/100`}>
            {healthScore}
          </div>
        </div>
      )}

      {/* User / Workspace Footer */}
      <div className="p-3 border-t border-borderMuted bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-primary flex items-center justify-center text-xs font-bold text-white shadow-md flex-shrink-0">
            BI
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-200 truncate">Executive Architect</span>
              <span className="text-[10px] text-slate-400 truncate">Content Strategy & Intelligence</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
