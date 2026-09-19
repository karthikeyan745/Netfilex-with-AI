import React, { useEffect, useState } from 'react';
import { 
  Film, 
  Clapperboard, 
  Tv, 
  Globe, 
  Tags, 
  Award, 
  TrendingUp,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboardFilter } from '../context/FilterContext';

// Smooth Animated Counter Component
function AnimatedNumber({ value, suffix = '', prefix = '' }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = typeof value === 'number' ? value : parseFloat(value) || 0;
    const duration = 650; // ms
    const stepTime = 16;
    const totalSteps = duration / stepTime;
    const stepIncrement = (end - start) / totalSteps;

    const timer = setInterval(() => {
      start += stepIncrement;
      if ((stepIncrement > 0 && start >= end) || (stepIncrement < 0 && start <= end)) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

// Mini SVG Sparkline Component
function Sparkline({ data = [], color = '#E50914' }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 76;
  const height = 26;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#grad-${color.replace('#', '')})`}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function KpiRow() {
  const { computedAnalytics, filters, toggleFilter } = useDashboardFilter();
  const kpis = computedAnalytics?.kpis || {};

  const totalTitles = kpis.totalTitles || 0;
  const moviesCount = kpis.moviesCount || 0;
  const tvCount = kpis.tvCount || 0;
  const countriesCount = kpis.uniqueCountries || 0;
  const genresCount = kpis.uniqueGenres || 0;
  const maturePct = kpis.maturePct || 0;

  const sparklines = kpis.sparklines || {
    total: [25, 88, 443, 1225, 1685, 2153, 2009, 117],
    movies: [19, 58, 258, 858, 1255, 1497, 1312, 80],
    tv: [6, 30, 185, 367, 430, 656, 697, 37],
    countries: [12, 24, 45, 68, 82, 104, 118, 42],
    genres: [18, 26, 34, 38, 41, 42, 42, 35],
    mature: [15, 52, 270, 750, 1050, 1350, 1240, 75]
  };

  const cards = [
    {
      id: 'total',
      title: 'Total Titles',
      value: totalTitles,
      trend: totalTitles > 0 ? '+18.4%' : '0%',
      sublabel: 'Catalog Volume',
      icon: Film,
      color: '#E50914',
      sparklineData: sparklines.total,
      onClick: null,
      isActive: false
    },
    {
      id: 'movies',
      title: 'Movies',
      value: moviesCount,
      trend: totalTitles > 0 ? `${Math.round((moviesCount / totalTitles) * 100)}%` : '0%',
      sublabel: 'Feature Films',
      icon: Clapperboard,
      color: '#FB923C',
      sparklineData: sparklines.movies,
      onClick: () => toggleFilter('type', 'Movie'),
      isActive: filters.type === 'Movie'
    },
    {
      id: 'tv',
      title: 'TV Shows',
      value: tvCount,
      trend: totalTitles > 0 ? `${Math.round((tvCount / totalTitles) * 100)}%` : '0%',
      sublabel: 'TV Series',
      icon: Tv,
      color: '#38BDF8',
      sparklineData: sparklines.tv,
      onClick: () => toggleFilter('type', 'TV Show'),
      isActive: filters.type === 'TV Show'
    },
    {
      id: 'countries',
      title: 'Countries',
      value: countriesCount,
      trend: `${countriesCount} Mkts`,
      sublabel: 'Global Footprint',
      icon: Globe,
      color: '#34D399',
      sparklineData: sparklines.countries,
      onClick: null,
      isActive: Boolean(filters.country)
    },
    {
      id: 'genres',
      title: 'Genres',
      value: genresCount,
      trend: `${genresCount} Hubs`,
      sublabel: 'Classifications',
      icon: Tags,
      color: '#A855F7',
      sparklineData: sparklines.genres,
      onClick: null,
      isActive: Boolean(filters.genre)
    },
    {
      id: 'maturity',
      title: 'Mature Content',
      value: maturePct,
      suffix: '%',
      trend: 'TV-MA / R',
      sublabel: 'Quality Score',
      icon: Award,
      color: '#FACC15',
      sparklineData: sparklines.mature,
      onClick: () => toggleFilter('rating', 'TV-MA'),
      isActive: filters.rating === 'TV-MA'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.04 }}
            onClick={card.onClick || undefined}
            className={`glass-card-executive kpi-card-glow p-4 flex flex-col justify-between h-[155px] relative overflow-hidden group select-none transition-all ${
              card.onClick ? 'cursor-pointer hover:border-primary/50' : 'cursor-default'
            } ${
              card.isActive 
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-slate-900 border-primary bg-primary/10 shadow-lg shadow-primary/20' 
                : ''
            }`}
          >
            {/* Header: Label & Icon */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider">
                  {card.title}
                </span>
                {card.isActive && (
                  <span className="text-[9px] text-primary font-bold flex items-center gap-0.5">
                    <Check size={9} /> Filtered
                  </span>
                )}
              </div>
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0"
                style={{ 
                  backgroundColor: `${card.color}15`, 
                  border: `1px solid ${card.color}30` 
                }}
              >
                <Icon size={16} style={{ color: card.color }} />
              </div>
            </div>

            {/* KPI Number */}
            <div className="my-1">
              <span className="text-2xl font-black text-white tracking-tight">
                <AnimatedNumber value={card.value} suffix={card.suffix || ''} />
              </span>
            </div>

            {/* Bottom Row: Trend & Sparkline */}
            <div className="flex items-end justify-between pt-2 border-t border-white/5">
              <div className="flex flex-col">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <TrendingUp size={11} /> {card.trend}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[85px]">
                  {card.sublabel}
                </span>
              </div>

              {/* Sparkline */}
              <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                <Sparkline data={card.sparklineData} color={card.color} />
              </div>
            </div>

            {/* Subtle glow background */}
            <div 
              className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-500"
              style={{ backgroundColor: card.color }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
