import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import catalogData from '../data/netflixCatalog.json';
import defaultAnalytics from '../data/executiveAnalytics.json';

import { COUNTRY_FLAGS, COUNTRY_ISO, COUNTRY_NAME_MAP } from '../data/countryMeta';

// Precompute default stats across full catalog for all 117+ countries
const defaultAllCountryStats = (() => {
  const stats = {};
  (catalogData || []).forEach(item => {
    if (!item.country || item.country === 'Unknown Country') return;
    const countries = item.country.split(',').map(c => c.trim()).filter(Boolean);
    countries.forEach(c => {
      if (!stats[c]) {
        stats[c] = {
          country: c,
          count: 0,
          movies: 0,
          tvShows: 0,
          genres: {},
          ratings: {},
          iso: COUNTRY_ISO[c] || c.substring(0, 3).toUpperCase(),
          flag: COUNTRY_FLAGS[c] || '🌐'
        };
      }
      stats[c].count++;
      if (item.type === 'Movie') stats[c].movies++;
      if (item.type === 'TV Show') stats[c].tvShows++;
      if (item.genres) {
        item.genres.split(',').forEach(g => {
          const gn = g.trim();
          if (gn) stats[c].genres[gn] = (stats[c].genres[gn] || 0) + 1;
        });
      }
      if (item.rating) {
        stats[c].ratings[item.rating] = (stats[c].ratings[item.rating] || 0) + 1;
      }
    });
  });

  Object.values(stats).forEach(s => {
    s.topGenre = Object.entries(s.genres).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Dramas';
    s.avgRating = Object.entries(s.ratings).sort((a, b) => b[1] - a[1])[0]?.[0] || 'TV-MA';
    s.share = catalogData.length > 0 ? Math.round((s.count / catalogData.length) * 1000) / 10 : 0;
  });

  return stats;
})();

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  // Global Filter State with multi-country support
  const [filters, setFilters] = useState({
    search: '',
    type: null,          // 'Movie' | 'TV Show' | null
    year: null,          // e.g. 2020 | 'Pre-2015' | null
    genre: null,         // e.g. 'Dramas' | null
    country: null,       // primary single country
    countries: [],       // array of selected countries for multi-select
    rating: null,        // e.g. 'TV-MA' | null
    month: null,         // e.g. 'December' | 'Dec' | null
    director: null,      // e.g. 'Rajiv Chilaka' | null
    actor: null,         // e.g. 'Anupam Kher' | null
    durationTier: null,  // e.g. '90-120m' | '1 Season' | null
    era: null,           // e.g. '2018-2019' | null
    region: null,        // e.g. 'South Asia' | null
    selectedTitleId: null
  });

  // Toggle Country with Multi-Select Support
  const toggleCountryFilter = useCallback((countryName, isMulti = false) => {
    if (!countryName) return;
    setFilters(prev => {
      let currentList = prev.countries && prev.countries.length > 0 
        ? [...prev.countries] 
        : prev.country ? [prev.country] : [];

      let nextList;
      if (isMulti) {
        if (currentList.includes(countryName)) {
          nextList = currentList.filter(c => c !== countryName);
        } else {
          nextList = [...currentList, countryName];
        }
      } else {
        if (currentList.length === 1 && currentList[0] === countryName) {
          nextList = [];
        } else {
          nextList = [countryName];
        }
      }

      return {
        ...prev,
        country: nextList[0] || null,
        countries: nextList
      };
    });
  }, []);

  // Toggle filter value (Power BI behavior)
  const toggleFilter = useCallback((dimension, value, isMulti = false) => {
    if (dimension === 'country') {
      toggleCountryFilter(value, isMulti);
      return;
    }
    setFilters(prev => {
      const current = prev[dimension];
      const isSame = current === value;
      return {
        ...prev,
        [dimension]: isSame ? null : value
      };
    });
  }, [toggleCountryFilter]);

  const setFilter = useCallback((dimension, value) => {
    if (dimension === 'country') {
      setFilters(prev => ({
        ...prev,
        country: value,
        countries: value ? [value] : []
      }));
      return;
    }
    setFilters(prev => ({
      ...prev,
      [dimension]: value
    }));
  }, []);

  const clearFilter = useCallback((dimension) => {
    setFilters(prev => {
      if (dimension === 'country' || dimension === 'countries') {
        return { ...prev, country: null, countries: [] };
      }
      return {
        ...prev,
        [dimension]: dimension === 'search' ? '' : null
      };
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      search: '',
      type: null,
      year: null,
      genre: null,
      country: null,
      countries: [],
      rating: null,
      month: null,
      director: null,
      actor: null,
      durationTier: null,
      era: null,
      region: null,
      selectedTitleId: null
    });
  }, []);

  // Compute Filtered Catalog Records
  const filteredCatalog = useMemo(() => {
    const activeCountries = filters.countries && filters.countries.length > 0 
      ? filters.countries 
      : filters.country ? [filters.country] : [];

    return catalogData.filter((item) => {
      // 1. Search filter
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesDirector = item.director?.toLowerCase().includes(q);
        const matchesCast = item.cast?.toLowerCase().includes(q);
        const matchesCountry = item.country?.toLowerCase().includes(q);
        const matchesGenre = item.genres?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDirector && !matchesCast && !matchesCountry && !matchesGenre) {
          return false;
        }
      }

      // 2. Type Filter (Movie vs TV Show)
      if (filters.type && item.type !== filters.type) {
        return false;
      }

      // 3. Year Filter
      if (filters.year) {
        if (filters.year === 'Pre-2015') {
          if (item.year_added >= 2015) return false;
        } else {
          const yrNum = Number(filters.year);
          if (item.year_added !== yrNum && item.release_year !== yrNum) {
            return false;
          }
        }
      }

      // 4. Genre Filter
      if (filters.genre) {
        if (!item.genres?.toLowerCase().includes(filters.genre.toLowerCase())) {
          return false;
        }
      }

      // 5. Country Filter (supports single and multi-country selection)
      if (activeCountries.length > 0) {
        const itemCountry = item.country || '';
        const matchesCountry = activeCountries.some(c => 
          itemCountry.toLowerCase().includes(c.toLowerCase()) ||
          (COUNTRY_NAME_MAP[c] && itemCountry.toLowerCase().includes(COUNTRY_NAME_MAP[c].toLowerCase()))
        );
        if (!matchesCountry) {
          return false;
        }
      }

      // 6. Rating Filter
      if (filters.rating) {
        if (item.rating !== filters.rating) {
          return false;
        }
      }

      // 7. Month Filter
      if (filters.month) {
        const m = filters.month.toLowerCase();
        const itemMonth = (item.month_name_added || '').toLowerCase();
        const itemDate = (item.date_added || '').toLowerCase();
        if (!itemMonth.startsWith(m.substring(0, 3)) && !itemDate.includes(m.substring(0, 3))) {
          return false;
        }
      }

      // 8. Director Filter
      if (filters.director) {
        if (!item.director?.toLowerCase().includes(filters.director.toLowerCase())) {
          return false;
        }
      }

      // 9. Actor Filter
      if (filters.actor) {
        if (!item.cast?.toLowerCase().includes(filters.actor.toLowerCase())) {
          return false;
        }
      }

      // 10. Duration Tier Filter
      if (filters.durationTier) {
        if (item.type === 'Movie') {
          const dur = item.duration_num || 0;
          if (filters.durationTier === '< 60m' && dur >= 60) return false;
          if (filters.durationTier === '60-90m' && (dur < 60 || dur > 90)) return false;
          if (filters.durationTier === '90-120m' && (dur < 90 || dur > 120)) return false;
          if (filters.durationTier === '120-150m' && (dur < 120 || dur > 150)) return false;
          if (filters.durationTier === '150m+' && dur < 150) return false;
        } else if (item.type === 'TV Show') {
          const seasons = item.duration_num || 1;
          if (filters.durationTier === '1 Season' && seasons !== 1) return false;
          if (filters.durationTier === '2 Seasons' && seasons !== 2) return false;
          if (filters.durationTier === '3 Seasons' && seasons !== 3) return false;
          if (filters.durationTier === '4+ Seasons' && seasons < 4) return false;
        }
      }

      // 11. Era Filter
      if (filters.era) {
        const rYear = item.release_year || 0;
        if (filters.era === '1940-1979' && (rYear < 1940 || rYear > 1979)) return false;
        if (filters.era === '1980-1999' && (rYear < 1980 || rYear > 1999)) return false;
        if (filters.era === '2000-2009' && (rYear < 2000 || rYear > 2009)) return false;
        if (filters.era === '2010-2014' && (rYear < 2010 || rYear > 2014)) return false;
        if (filters.era === '2015-2017' && (rYear < 2015 || rYear > 2017)) return false;
        if (filters.era === '2018-2019' && (rYear < 2018 || rYear > 2019)) return false;
        if (filters.era === '2020-2021' && (rYear < 2020 || rYear > 2021)) return false;
      }

      // 12. Region Filter
      if (filters.region) {
        const countryStr = item.country || '';
        const reg = filters.region;
        if (reg === 'North America' && !countryStr.includes('United States') && !countryStr.includes('Canada')) return false;
        if (reg === 'South Asia' && !countryStr.includes('India') && !countryStr.includes('Pakistan') && !countryStr.includes('Bangladesh')) return false;
        if (reg === 'Europe' && !countryStr.includes('United Kingdom') && !countryStr.includes('France') && !countryStr.includes('Spain') && !countryStr.includes('Germany') && !countryStr.includes('Italy')) return false;
        if (reg === 'East Asia' && !countryStr.includes('Japan') && !countryStr.includes('South Korea') && !countryStr.includes('Taiwan') && !countryStr.includes('Hong Kong')) return false;
        if (reg === 'Latin America' && !countryStr.includes('Mexico') && !countryStr.includes('Brazil') && !countryStr.includes('Argentina') && !countryStr.includes('Colombia')) return false;
        if (reg === 'Middle East / Africa' && !countryStr.includes('Egypt') && !countryStr.includes('Turkey') && !countryStr.includes('Nigeria') && !countryStr.includes('South Africa')) return false;
      }

      // 13. Specific Title Highlight
      if (filters.selectedTitleId && item.id !== filters.selectedTitleId) {
        return false;
      }

      return true;
    });
  }, [filters]);

  // Is any filter currently applied?
  const isFiltered = useMemo(() => {
    return Boolean(
      filters.search.trim() ||
      filters.type ||
      filters.year ||
      filters.genre ||
      filters.country ||
      (filters.countries && filters.countries.length > 0) ||
      filters.rating ||
      filters.month ||
      filters.director ||
      filters.actor ||
      filters.durationTier ||
      filters.era ||
      filters.region ||
      filters.selectedTitleId
    );
  }, [filters]);

  // Active filter chips list
  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (filters.search.trim()) chips.push({ key: 'search', label: 'Search', value: `"${filters.search}"` });
    if (filters.type) chips.push({ key: 'type', label: 'Type', value: filters.type });
    if (filters.genre) chips.push({ key: 'genre', label: 'Genre', value: filters.genre });

    const activeCountries = filters.countries && filters.countries.length > 0 
      ? filters.countries 
      : filters.country ? [filters.country] : [];

    if (activeCountries.length > 0) {
      if (activeCountries.length <= 2) {
        activeCountries.forEach(c => {
          chips.push({ key: `country-${c}`, label: 'Country', value: c, rawKey: 'country' });
        });
      } else {
        chips.push({ key: 'country', label: 'Countries', value: `${activeCountries.length} Selected (${activeCountries.slice(0, 2).join(', ')}...)` });
      }
    }

    if (filters.rating) chips.push({ key: 'rating', label: 'Rating', value: filters.rating });
    if (filters.year) chips.push({ key: 'year', label: 'Year', value: String(filters.year) });
    if (filters.month) chips.push({ key: 'month', label: 'Month', value: filters.month });
    if (filters.director) chips.push({ key: 'director', label: 'Director', value: filters.director });
    if (filters.actor) chips.push({ key: 'actor', label: 'Actor', value: filters.actor });
    if (filters.durationTier) chips.push({ key: 'durationTier', label: 'Duration', value: filters.durationTier });
    if (filters.era) chips.push({ key: 'era', label: 'Release Era', value: filters.era });
    if (filters.region) chips.push({ key: 'region', label: 'Region', value: filters.region });
    if (filters.selectedTitleId) {
      const selectedItem = catalogData.find(i => i.id === filters.selectedTitleId);
      chips.push({ key: 'selectedTitleId', label: 'Title', value: selectedItem?.title || filters.selectedTitleId });
    }
    return chips;
  }, [filters]);

  // Breadcrumb Trail
  const filterBreadcrumb = useMemo(() => {
    const parts = ['All Content'];
    if (filters.region) parts.push(filters.region);
    const activeCountries = filters.countries && filters.countries.length > 0 
      ? filters.countries 
      : filters.country ? [filters.country] : [];
    if (activeCountries.length > 0) parts.push(activeCountries.join(', '));
    if (filters.type) parts.push(filters.type === 'Movie' ? 'Movies' : 'TV Shows');
    if (filters.genre) parts.push(filters.genre);
    if (filters.rating) parts.push(filters.rating);
    if (filters.year) parts.push(String(filters.year));
    if (filters.month) parts.push(filters.month);
    return parts.join(' > ');
  }, [filters]);

  // Dynamically Re-Aggregated Visual Analytics Engine
  const computedAnalytics = useMemo(() => {
    if (!isFiltered) {
      return {
        ...defaultAnalytics,
        allCountryStats: defaultAllCountryStats
      };
    }

    const total = filteredCatalog.length;
    const moviesCount = filteredCatalog.filter(i => i.type === 'Movie').length;
    const tvCount = filteredCatalog.filter(i => i.type === 'TV Show').length;

    // Unique countries
    const countriesSet = new Set();
    const countryCounts = {};
    filteredCatalog.forEach(i => {
      if (i.country && i.country !== 'Unknown Country') {
        i.country.split(',').forEach(c => {
          const clean = c.trim();
          if (clean) {
            countriesSet.add(clean);
            countryCounts[clean] = (countryCounts[clean] || 0) + 1;
          }
        });
      }
    });

    // Unique genres
    const genresSet = new Set();
    const genreCounts = {};
    filteredCatalog.forEach(i => {
      if (i.genres) {
        i.genres.split(',').forEach(g => {
          const clean = g.trim();
          if (clean) {
            genresSet.add(clean);
            genreCounts[clean] = (genreCounts[clean] || 0) + 1;
          }
        });
      }
    });

    // Maturity Ratings
    const matureCount = filteredCatalog.filter(i => ['TV-MA', 'R', 'NC-17'].includes(i.rating)).length;
    const maturePct = total > 0 ? Math.round((matureCount / total) * 1000) / 10 : 0;

    // Dynamic Sparklines across historical years (2014-2021)
    const sparklineYears = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021];
    const sparklines = {
      total: [],
      movies: [],
      tv: [],
      countries: [],
      genres: [],
      mature: []
    };
    sparklineYears.forEach(yr => {
      const yrSub = filteredCatalog.filter(i => i.year_added === yr);
      sparklines.total.push(yrSub.length);
      sparklines.movies.push(yrSub.filter(i => i.type === 'Movie').length);
      sparklines.tv.push(yrSub.filter(i => i.type === 'TV Show').length);
      const yrC = new Set();
      yrSub.forEach(i => (i.country || '').split(',').forEach(c => c.trim() && yrC.add(c.trim())));
      sparklines.countries.push(yrC.size);
      const yrG = new Set();
      yrSub.forEach(i => (i.genres || '').split(',').forEach(g => g.trim() && yrG.add(g.trim())));
      sparklines.genres.push(yrG.size);
      sparklines.mature.push(yrSub.filter(i => ['TV-MA', 'R', 'NC-17'].includes(i.rating)).length);
    });

    // Monthly breakdown
    const monthsOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthlyBreakdown = monthsOrder.map((mName) => {
      const mSub = filteredCatalog.filter(i => {
        const itemMonth = (i.month_name_added || '').toLowerCase();
        const itemDate = (i.date_added || '').toLowerCase();
        return itemMonth.startsWith(mName.toLowerCase().substring(0, 3)) || itemDate.includes(mName.toLowerCase().substring(0, 3));
      });
      return {
        month: mName.substring(0, 3),
        fullName: mName,
        total: mSub.length,
        movies: mSub.filter(i => i.type === 'Movie').length,
        tvShows: mSub.filter(i => i.type === 'TV Show').length
      };
    });

    // Type comparison
    const movieDurations = filteredCatalog.filter(i => i.type === 'Movie' && i.duration_num).map(i => i.duration_num);
    const avgMovieDur = movieDurations.length ? Math.round((movieDurations.reduce((a, b) => a + b, 0) / movieDurations.length) * 10) / 10 : 0;
    const tvSeries = filteredCatalog.filter(i => i.type === 'TV Show');
    const singleSeasonCount = tvSeries.filter(i => (i.duration_num || 1) === 1).length;
    const tvSingleSeasonPct = tvSeries.length > 0 ? Math.round((singleSeasonCount / tvSeries.length) * 1000) / 10 : 66.8;

    const typeComparison = {
      movies: {
        count: moviesCount,
        pct: total > 0 ? Math.round((moviesCount / total) * 1000) / 10 : 0,
        avgDurationMinutes: avgMovieDur
      },
      tvShows: {
        count: tvCount,
        pct: total > 0 ? Math.round((tvCount / total) * 1000) / 10 : 0,
        singleSeasonPct: `${tvSingleSeasonPct}%`
      }
    };

    // Top Genres
    const genreColors = ["#E50914", "#F43F5E", "#FB923C", "#FBBF24", "#34D399", "#2DD4BF", "#38BDF8", "#6366F1", "#A855F7", "#EC4899"];
    const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
    const topGenres = sortedGenres.slice(0, 10).map(([gName, gCount], idx) => ({
      genre: gName,
      count: gCount,
      pct: total > 0 ? Math.round((gCount / total) * 1000) / 10 : 0,
      color: genreColors[idx % genreColors.length]
    }));

    // High-speed O(N) single-pass stats for ALL countries
    const allCountryStats = {};
    filteredCatalog.forEach(item => {
      if (!item.country || item.country === 'Unknown Country') return;
      const cList = item.country.split(',');
      for (let cIdx = 0; cIdx < cList.length; cIdx++) {
        const c = cList[cIdx].trim();
        if (!c) continue;
        if (!allCountryStats[c]) {
          allCountryStats[c] = {
            country: c,
            count: 0,
            movies: 0,
            tvShows: 0,
            topGenre: 'Dramas',
            avgRating: 'TV-MA',
            iso: COUNTRY_ISO[c] || c.substring(0, 3).toUpperCase(),
            flag: COUNTRY_FLAGS[c] || '🌐',
            _genres: {},
            _ratings: {}
          };
        }
        const stat = allCountryStats[c];
        stat.count++;
        if (item.type === 'Movie') stat.movies++;
        else if (item.type === 'TV Show') stat.tvShows++;
        if (item.genres) {
          const gList = item.genres.split(',');
          for (let gIdx = 0; gIdx < gList.length; gIdx++) {
            const gn = gList[gIdx].trim();
            if (gn) stat._genres[gn] = (stat._genres[gn] || 0) + 1;
          }
        }
        if (item.rating) {
          stat._ratings[item.rating] = (stat._ratings[item.rating] || 0) + 1;
        }
      }
    });

    Object.values(allCountryStats).forEach(s => {
      s.topGenre = Object.entries(s._genres).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Dramas';
      s.avgRating = Object.entries(s._ratings).sort((a, b) => b[1] - a[1])[0]?.[0] || 'TV-MA';
      s.share = total > 0 ? Math.round((s.count / total) * 1000) / 10 : 0;
      delete s._genres;
      delete s._ratings;
    });

    // Top Countries (Array)
    const defaultCoords = defaultAnalytics.topCountries || [];
    const sortedCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]);
    const topCountries = sortedCountries.slice(0, 15).map(([cName, cCount]) => {
      const match = defaultCoords.find(dc => dc.country === cName);
      const cSub = filteredCatalog.filter(i => (i.country || '').includes(cName));
      return {
        country: cName,
        count: cCount,
        movies: cSub.filter(i => i.type === 'Movie').length,
        tvShows: cSub.filter(i => i.type === 'TV Show').length,
        iso: match ? match.iso : (COUNTRY_ISO[cName] || cName.substring(0, 3).toUpperCase()),
        lat: match ? match.lat : 20,
        lng: match ? match.lng : 0,
        region: match ? match.region : 'International',
        share: total > 0 ? Math.round((cCount / total) * 1000) / 10 : 0
      };
    });

    // Rating Distribution
    const ratingsOrder = ['TV-MA', 'TV-14', 'TV-PG', 'R', 'PG-13', 'TV-Y', 'TV-Y7', 'PG', 'TV-G', 'NR', 'G'];
    const ratingDistribution = ratingsOrder.map(r => {
      const rSub = filteredCatalog.filter(i => i.rating === r);
      return {
        rating: r,
        count: rSub.length,
        movies: rSub.filter(i => i.type === 'Movie').length,
        tvShows: rSub.filter(i => i.type === 'TV Show').length,
        pct: total > 0 ? Math.round((rSub.length / total) * 1000) / 10 : 0
      };
    });

    // Duration Box / Spread
    const tvDurations = filteredCatalog.filter(i => i.type === 'TV Show' && i.duration_num).map(i => i.duration_num);
    const sortedMovieDurs = [...movieDurations].sort((a, b) => a - b);
    const durationBox = {
      movies: {
        min: sortedMovieDurs.length ? sortedMovieDurs[0] : 0,
        q1: sortedMovieDurs.length ? sortedMovieDurs[Math.floor(sortedMovieDurs.length * 0.25)] : 0,
        median: sortedMovieDurs.length ? sortedMovieDurs[Math.floor(sortedMovieDurs.length * 0.5)] : 0,
        q3: sortedMovieDurs.length ? sortedMovieDurs[Math.floor(sortedMovieDurs.length * 0.75)] : 0,
        max: sortedMovieDurs.length ? sortedMovieDurs[sortedMovieDurs.length - 1] : 0,
        mean: avgMovieDur
      },
      movieBins: [
        { bin: "< 60m", label: "Short / Doc", count: movieDurations.filter(d => d < 60).length },
        { bin: "60-90m", label: "Standard", count: movieDurations.filter(d => d >= 60 && d < 90).length },
        { bin: "90-120m", label: "Feature (Core)", count: movieDurations.filter(d => d >= 90 && d <= 120).length },
        { bin: "120-150m", label: "Extended", count: movieDurations.filter(d => d > 120 && d <= 150).length },
        { bin: "150m+", label: "Epic", count: movieDurations.filter(d => d > 150).length }
      ],
      tvBins: [
        { bin: "1 Season", label: "Single Season", count: tvDurations.filter(d => d === 1).length, pct: tvDurations.length ? Math.round((tvDurations.filter(d => d === 1).length / tvDurations.length) * 1000) / 10 : 0 },
        { bin: "2 Seasons", label: "Sophomore", count: tvDurations.filter(d => d === 2).length, pct: tvDurations.length ? Math.round((tvDurations.filter(d => d === 2).length / tvDurations.length) * 1000) / 10 : 0 },
        { bin: "3 Seasons", label: "Established", count: tvDurations.filter(d => d === 3).length, pct: tvDurations.length ? Math.round((tvDurations.filter(d => d === 3).length / tvDurations.length) * 1000) / 10 : 0 },
        { bin: "4+ Seasons", label: "Flagship", count: tvDurations.filter(d => d >= 4).length, pct: tvDurations.length ? Math.round((tvDurations.filter(d => d >= 4).length / tvDurations.length) * 1000) / 10 : 0 }
      ]
    };

    // Release Eras
    const releaseDecades = [
      { decade: "1940-1979", min: 1940, max: 1979 },
      { decade: "1980-1999", min: 1980, max: 1999 },
      { decade: "2000-2009", min: 2000, max: 2009 },
      { decade: "2010-2014", min: 2010, max: 2014 },
      { decade: "2015-2017", min: 2015, max: 2017 },
      { decade: "2018-2019", min: 2018, max: 2019 },
      { decade: "2020-2021", min: 2020, max: 2021 }
    ];
    const vintageDistribution = releaseDecades.map(d => {
      const dSub = filteredCatalog.filter(i => i.release_year >= d.min && i.release_year <= d.max);
      return {
        era: d.decade,
        count: dSub.length,
        movies: dSub.filter(i => i.type === 'Movie').length,
        tvShows: dSub.filter(i => i.type === 'TV Show').length
      };
    });

    // Growth trajectory (2012-2021)
    const growthYears = [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021];
    let runningCum = 0;
    const growthTrajectory = growthYears.map(yr => {
      const yrSub = filteredCatalog.filter(i => i.year_added === yr);
      runningCum += yrSub.length;
      return {
        year: String(yr),
        added: yrSub.length,
        cumulative: runningCum,
        movies: yrSub.filter(i => i.type === 'Movie').length,
        tvShows: yrSub.filter(i => i.type === 'TV Show').length
      };
    });

    // Genre Heatmap Matrix
    const top8Genres = topGenres.slice(0, 8).map(g => g.genre);
    const top5Ratings = ['TV-MA', 'TV-14', 'R', 'TV-PG', 'PG-13'];
    const heatmapMatrix = top8Genres.map(g => {
      const gSub = filteredCatalog.filter(i => (i.genres || '').includes(g));
      const row = { genre: g };
      top5Ratings.forEach(r => {
        row[r] = gSub.filter(i => i.rating === r).length;
      });
      return row;
    });

    // Top Directors
    const dirCounts = {};
    filteredCatalog.forEach(i => {
      if (i.director && i.director !== 'Unknown Director') {
        i.director.split(',').forEach(d => {
          const clean = d.trim();
          if (clean) dirCounts[clean] = (dirCounts[clean] || 0) + 1;
        });
      }
    });
    const topDirectos = Object.entries(dirCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([dName, count]) => {
        const dSub = filteredCatalog.filter(i => (i.director || '').includes(dName));
        return {
          director: dName,
          count,
          primaryType: dSub.filter(i => i.type === 'Movie').length >= dSub.filter(i => i.type === 'TV Show').length ? 'Movie' : 'TV Show',
          topWork: dSub[0]?.title || 'N/A'
        };
      });

    // Top Actors Treemap
    const actorCounts = {};
    filteredCatalog.forEach(i => {
      if (i.cast && i.cast !== 'Unknown Cast') {
        i.cast.split(',').forEach(a => {
          const clean = a.trim();
          if (clean) actorCounts[clean] = (actorCounts[clean] || 0) + 1;
        });
      }
    });
    const topActors = Object.entries(actorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([aName, val]) => {
        const aSub = filteredCatalog.filter(i => (i.cast || '').includes(aName));
        return {
          name: aName,
          value: val,
          country: aSub[0]?.country?.split(',')[0].trim() || 'Global',
          titles: aSub.slice(0, 3).map(i => i.title)
        };
      });

    // Regional Summary
    const regSummary = [
      { region: "North America", count: (countryCounts["United States"] || 0) + (countryCounts["Canada"] || 0), color: "#E50914" },
      { region: "South Asia", count: (countryCounts["India"] || 0) + (countryCounts["Pakistan"] || 0) + (countryCounts["Bangladesh"] || 0), color: "#FB923C" },
      { region: "Europe", count: (countryCounts["United Kingdom"] || 0) + (countryCounts["France"] || 0) + (countryCounts["Spain"] || 0) + (countryCounts["Germany"] || 0) + (countryCounts["Italy"] || 0), color: "#38BDF8" },
      { region: "East Asia", count: (countryCounts["Japan"] || 0) + (countryCounts["South Korea"] || 0) + (countryCounts["Taiwan"] || 0) + (countryCounts["Hong Kong"] || 0), color: "#A855F7" },
      { region: "Latin America", count: (countryCounts["Mexico"] || 0) + (countryCounts["Brazil"] || 0) + (countryCounts["Argentina"] || 0) + (countryCounts["Colombia"] || 0), color: "#34D399" },
      { region: "Middle East / Africa", count: (countryCounts["Egypt"] || 0) + (countryCounts["Turkey"] || 0) + (countryCounts["Nigeria"] || 0) + (countryCounts["South Africa"] || 0), color: "#FBBF24" }
    ];

    // Dynamic AI Health Score for this slice
    const freshnessScore = Math.min(99, Math.max(50, Math.round(75 + (sparklines.total[7] || 0) / Math.max(1, (sparklines.total[6] || 1)) * 20)));
    const diversityScore = Math.min(98, Math.max(40, countriesSet.size * 2));
    const retentionScore = Math.min(95, Math.max(30, 100 - Math.round(tvSingleSeasonPct)));
    const healthScore = Math.round((freshnessScore * 0.35) + (diversityScore * 0.35) + (retentionScore * 0.3));

    return {
      kpis: {
        totalTitles: total,
        moviesCount,
        tvCount,
        uniqueCountries: countriesSet.size,
        uniqueGenres: genresSet.size,
        maturePct,
        matureCount,
        sparklines
      },
      monthlyBreakdown,
      typeComparison,
      topGenres,
      topCountries,
      allCountryStats,
      ratingDistribution,
      durationBox,
      vintageDistribution,
      growthTrajectory,
      heatmapMatrix,
      topDirectos,
      topActors,
      regionalSummary: regSummary,
      executiveInsights: {
        ...defaultAnalytics.executiveInsights,
        healthScore,
        metrics: {
          freshness: freshnessScore,
          globalDiversity: diversityScore,
          retentionStability: retentionScore,
          licensingEfficiency: 88
        }
      }
    };
  }, [filteredCatalog, isFiltered]);

  const selectedCountries = useMemo(() => {
    return filters.countries && filters.countries.length > 0 
      ? filters.countries 
      : (filters.country ? [filters.country] : []);
  }, [filters.countries, filters.country]);

  return (
    <FilterContext.Provider
      value={{
        filters,
        toggleFilter,
        toggleCountryFilter,
        selectedCountries,
        setFilter,
        clearFilter,
        clearAllFilters,
        filteredCatalog,
        computedAnalytics,
        isFiltered,
        activeFilterChips,
        filterBreadcrumb,
        totalCatalogCount: catalogData.length
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useDashboardFilter() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useDashboardFilter must be used within a FilterProvider');
  }
  return context;
}
