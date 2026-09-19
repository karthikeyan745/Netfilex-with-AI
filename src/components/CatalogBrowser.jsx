import React, { useState, useMemo } from 'react';
import { Film, Tv, Filter, Calendar, Globe, Star, X, Info } from 'lucide-react';
import catalogData from '../data/netflixData.json';

export default function CatalogBrowser({ searchTerm, setSearchTerm }) {
  const [selectedType, setSelectedType] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredData = useMemo(() => {
    return catalogData.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cast.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.listed_in.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedType === 'All' || item.type === selectedType;
      const matchesRating = selectedRating === 'All' || item.rating === selectedRating;

      return matchesSearch && matchesType && matchesRating;
    });
  }, [searchTerm, selectedType, selectedRating]);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-400">
          <Filter className="w-4 h-4 text-red-500" />
          <span>Catalog Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Type Filter */}
          <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
            {['All', 'Movie', 'TV Show'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 rounded-md transition-all ${
                  selectedType === type
                    ? 'bg-red-600 text-white font-medium shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {type === 'All' ? 'All Types' : type === 'Movie' ? 'Movies' : 'TV Shows'}
              </button>
            ))}
          </div>

          {/* Rating Filter */}
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 px-3 py-1.5 rounded-lg focus:outline-none focus:border-red-500"
          >
            <option value="All">All Ratings</option>
            <option value="TV-MA">TV-MA</option>
            <option value="TV-14">TV-14</option>
            <option value="R">R</option>
            <option value="PG-13">PG-13</option>
            <option value="TV-PG">TV-PG</option>
            <option value="TV-Y7">TV-Y7</option>
          </select>

          {/* Reset Filters */}
          {(selectedType !== 'All' || selectedRating !== 'All' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedType('All');
                setSelectedRating('All');
                setSearchTerm('');
              }}
              className="text-xs text-red-400 hover:text-red-300 underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="text-xs text-zinc-400 font-mono">
          Showing <span className="text-white font-bold">{filteredData.length}</span> of {catalogData.length} entries
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredData.slice(0, 48).map((item) => (
          <div
            key={item.show_id}
            onClick={() => setSelectedItem(item)}
            className="glass-card p-4 flex flex-col justify-between hover:border-red-500/50 cursor-pointer group transition-all duration-300"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    item.type === 'Movie'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  }`}
                >
                  {item.type}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                  {item.rating || 'NR'}
                </span>
              </div>

              <h4 className="font-bold text-white text-base mt-2 group-hover:text-red-400 transition-colors line-clamp-1">
                {item.title}
              </h4>

              <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1 font-mono">
                <Calendar className="w-3 h-3 text-zinc-500" /> {item.release_year}
              </span>
              <span className="font-mono text-zinc-300">{item.duration}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card max-w-2xl w-full p-6 relative bg-zinc-900 border-zinc-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded ${
                  selectedItem.type === 'Movie'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                }`}
              >
                {selectedItem.type}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
                {selectedItem.rating || 'NR'}
              </span>
              <span className="text-xs text-zinc-400 font-mono">{selectedItem.duration}</span>
            </div>

            <h2 className="text-2xl font-extrabold text-white mt-3">{selectedItem.title}</h2>
            <p className="text-sm text-zinc-300 mt-2 leading-relaxed">{selectedItem.description}</p>

            <div className="mt-6 space-y-3 pt-4 border-t border-zinc-800 text-xs">
              <div className="flex">
                <span className="w-24 text-zinc-500 font-medium">Director:</span>
                <span className="text-zinc-200 font-medium">{selectedItem.director || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-zinc-500 font-medium">Cast:</span>
                <span className="text-zinc-200 flex-1">{selectedItem.cast || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-zinc-500 font-medium">Genres:</span>
                <span className="text-red-400 font-medium">{selectedItem.listed_in}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-zinc-500 font-medium">Country:</span>
                <span className="text-zinc-200">{selectedItem.country}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-zinc-500 font-medium">Added Date:</span>
                <span className="text-zinc-200 font-mono">{selectedItem.date_added}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg transition-colors shadow-lg shadow-red-900/40"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
