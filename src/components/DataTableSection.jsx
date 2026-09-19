import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Eye, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Film,
  Tv,
  Star,
  Sparkles,
  Calendar,
  Clock,
  Globe,
  LayoutGrid,
  List,
  Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { useDashboardFilter } from '../context/FilterContext';

export default function DataTableSection({ catalog: propCatalog } = {}) {
  const { 
    filteredCatalog: contextCatalog, 
    filters, 
    toggleFilter, 
    setFilter, 
    clearFilter 
  } = useDashboardFilter();

  const filteredCatalog = propCatalog || contextCatalog || [];

  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [localSearch, setLocalSearch] = useState('');
  const [sortField, setSortField] = useState('date_added');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [activeModalTitle, setActiveModalTitle] = useState(null);

  const ratingOptions = ['All', 'TV-MA', 'TV-14', 'TV-PG', 'R', 'PG-13', 'TV-Y', 'TV-Y7', 'PG', 'TV-G', 'NR', 'G'];

  // Apply local quick search on top of global filters if typed
  const dataList = useMemo(() => {
    if (!localSearch.trim()) return filteredCatalog;
    const q = localSearch.toLowerCase();
    return filteredCatalog.filter(item => 
      item.title?.toLowerCase().includes(q) ||
      item.director?.toLowerCase().includes(q) ||
      item.cast?.toLowerCase().includes(q) ||
      item.country?.toLowerCase().includes(q) ||
      item.genres?.toLowerCase().includes(q)
    );
  }, [filteredCatalog, localSearch]);

  // Sorting
  const sortedData = useMemo(() => {
    const list = [...dataList];
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'release_year' || sortField === 'year_added') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else if (sortField === 'duration') {
        aVal = Number(a.duration_num) || 0;
        bVal = Number(b.duration_num) || 0;
      } else {
        aVal = (aVal || '').toString().toLowerCase();
        bVal = (bVal || '').toString().toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [dataList, sortField, sortDirection]);

  // Pagination
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    const exportRows = dataList.map(item => ({
      'Show ID': item.id,
      'Type': item.type,
      'Title': item.title,
      'Director': item.director,
      'Cast': item.cast,
      'Country': item.country,
      'Release Year': item.release_year,
      'Rating': item.rating,
      'Duration': item.duration,
      'Genres': item.genres,
      'Date Added': item.date_added
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Catalog Records');
    XLSX.writeFile(wb, `netflix_catalog_filtered_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = ['Show ID', 'Type', 'Title', 'Director', 'Country', 'Release Year', 'Rating', 'Duration', 'Genres', 'Date Added'];
    const rows = dataList.map(d => [
      `"${d.id}"`,
      `"${d.type}"`,
      `"${(d.title || '').replace(/"/g, '""')}"`,
      `"${(d.director || '').replace(/"/g, '""')}"`,
      `"${(d.country || '').replace(/"/g, '""')}"`,
      d.release_year,
      `"${d.rating}"`,
      `"${d.duration}"`,
      `"${(d.genres || '').replace(/"/g, '""')}"`,
      `"${d.date_added}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `netflix_catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF Report
  const handleExportPdf = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setTextColor(229, 9, 20);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('NETFLIX EXECUTIVE BI REPORT', 14, 20);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Catalog Sample Audit (${dataList.length.toLocaleString()} matching titles)`, 14, 28);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} · Power BI Filter Sync`, 14, 34);

    doc.setFillColor(30, 41, 59);
    doc.roundedRect(14, 40, 182, 22, 3, 3, 'F');
    doc.setTextColor(200, 210, 230);
    doc.setFontSize(9);
    doc.text(`Matching Records: ${dataList.length.toLocaleString()}  |  Active Filters Synchronized`, 20, 52);

    let y = 72;
    doc.setFillColor(229, 9, 20);
    doc.rect(14, y - 6, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Title', 16, y);
    doc.text('Type', 75, y);
    doc.text('Rating', 105, y);
    doc.text('Release', 130, y);
    doc.text('Country', 155, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(220, 225, 235);
    const sample = dataList.slice(0, 22);
    sample.forEach((item, idx) => {
      y += 8;
      if (idx % 2 === 0) {
        doc.setFillColor(24, 33, 47);
        doc.rect(14, y - 5.5, 182, 8, 'F');
      }
      const cleanTitle = (item.title || '').substring(0, 30);
      const cleanCountry = (item.country || '').split(',')[0].substring(0, 16);
      doc.text(cleanTitle, 16, y);
      doc.text(item.type || '', 75, y);
      doc.text(item.rating || '', 105, y);
      doc.text(String(item.release_year || ''), 130, y);
      doc.text(cleanCountry, 155, y);
    });

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Executive Intelligence Dashboard · Confidential Business Intelligence', 14, 285);
    doc.save(`netflix_executive_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-slate-500" />;
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} className="text-primary" />
    ) : (
      <ArrowDown size={12} className="text-primary" />
    );
  };

  return (
    <div className="glass-card-executive p-5">
      {/* Top Header & Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Enterprise Catalog Explorer</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
              {dataList.length.toLocaleString()} matching
            </span>
          </h2>
          <p className="text-xs text-textSecondary mt-0.5">
            Click row to cross-filter charts & inspect details
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Table / Grid Mode Toggle */}
          <div className="flex bg-slate-900 border border-slate-700/80 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                viewMode === 'table' ? 'bg-primary text-white font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List size={13} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                viewMode === 'grid' ? 'bg-primary text-white font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid size={13} />
            </button>
          </div>

          {/* Quick Table Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter current view..."
              className="bg-slate-900/90 border border-slate-700/70 text-xs text-white rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-primary w-36 sm:w-48"
            />
          </div>

          {/* Global Type Slicer in Table */}
          <select
            value={filters.type || 'All'}
            onChange={(e) => {
              toggleFilter('type', e.target.value === 'All' ? null : e.target.value);
              setCurrentPage(1);
            }}
            className={`text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-primary cursor-pointer border ${
              filters.type ? 'bg-primary/20 text-white border-primary/50 font-bold' : 'bg-slate-900/90 border-slate-700/70 text-slate-300'
            }`}
          >
            <option value="All">All Types</option>
            <option value="Movie">Movies</option>
            <option value="TV Show">TV Shows</option>
          </select>

          {/* Rating Filter */}
          <select
            value={filters.rating || 'All'}
            onChange={(e) => {
              toggleFilter('rating', e.target.value === 'All' ? null : e.target.value);
              setCurrentPage(1);
            }}
            className={`text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-primary cursor-pointer border ${
              filters.rating ? 'bg-primary/20 text-white border-primary/50 font-bold' : 'bg-slate-900/90 border-slate-700/70 text-slate-300'
            }`}
          >
            {ratingOptions.map(r => (
              <option key={r} value={r}>{r === 'All' ? 'All Ratings' : r}</option>
            ))}
          </select>

          {/* Export Actions */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={handleExportCsv}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
              title="Export filtered data to CSV"
            >
              <Download size={13} className="text-slate-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5 transition-all"
              title="Export formatted Excel (.xlsx)"
            >
              <FileSpreadsheet size={13} className="text-emerald-400" />
              <span>Excel</span>
            </button>

            <button
              onClick={handleExportPdf}
              className="px-2.5 py-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-red-300 text-xs font-semibold border border-primary/40 flex items-center gap-1.5 transition-all"
              title="Download Executive PDF"
            >
              <FileText size={13} className="text-primary" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold select-none">
                <th 
                  onClick={() => handleSort('title')} 
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Title</span>
                    {getSortIcon('title')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('type')} 
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Type</span>
                    {getSortIcon('type')}
                  </div>
                </th>
                <th className="py-3 px-3">Director</th>
                <th className="py-3 px-3">Country</th>
                <th 
                  onClick={() => handleSort('release_year')} 
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Year</span>
                    {getSortIcon('release_year')}
                  </div>
                </th>
                <th className="py-3 px-3">Rating</th>
                <th 
                  onClick={() => handleSort('duration')} 
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Duration</span>
                    {getSortIcon('duration')}
                  </div>
                </th>
                <th className="py-3 px-3">Genres</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => {
                  const isRowSelected = filters.selectedTitleId === item.id;
                  return (
                    <tr 
                      key={item.id}
                      onClick={() => toggleFilter('selectedTitleId', item.id)}
                      className={`transition-colors cursor-pointer group ${
                        isRowSelected ? 'bg-primary/20 text-white font-bold' : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <td className="py-2.5 px-4 font-semibold text-white max-w-[200px] truncate group-hover:text-primary transition-colors">
                        {item.title}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          item.type === 'Movie' 
                            ? 'bg-red-500/15 text-red-300 border border-red-500/25' 
                            : 'bg-sky-500/15 text-sky-300 border border-sky-500/25'
                        }`}>
                          {item.type === 'Movie' ? <Film size={10} /> : <Tv size={10} />}
                          {item.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 max-w-[130px] truncate text-slate-400">
                        {item.director !== 'Unknown Director' ? item.director : '—'}
                      </td>
                      <td className="py-2.5 px-3 max-w-[120px] truncate text-slate-400">
                        {item.country !== 'Unknown Country' ? item.country : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">
                        {item.release_year}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          ['TV-MA', 'R'].includes(item.rating)
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {item.rating}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        {item.duration}
                      </td>
                      <td className="py-2.5 px-3 max-w-[160px] truncate text-slate-400">
                        {item.genres}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModalTitle(item);
                          }}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-primary/20 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors"
                          title="Inspect Title Details"
                        >
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No catalog items found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* VIEW 2: CARD GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedData.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveModalTitle(item)}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-primary/50 cursor-pointer flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] group shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    item.type === 'Movie'
                      ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                      : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {item.rating}
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm group-hover:text-primary transition-colors line-clamp-1 mb-1">
                  {item.title}
                </h3>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {item.description || 'No description available.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                <span>{item.release_year} &bull; {item.duration}</span>
                <span className="text-primary font-semibold group-hover:underline">Inspect &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-xs text-textSecondary">
        <div className="flex items-center gap-2">
          <span>Showing</span>
          <span className="font-semibold text-white">
            {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0}
          </span>
          <span>to</span>
          <span className="font-semibold text-white">
            {Math.min(currentPage * pageSize, totalItems)}
          </span>
          <span>of</span>
          <span className="font-semibold text-white">{totalItems.toLocaleString()}</span>
          <span>entries</span>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="ml-3 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 text-xs"
          >
            <option value={10}>10 / page</option>
            <option value={12}>12 / page</option>
            <option value={24}>24 / page</option>
            <option value={48}>48 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>

        {/* Page Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 transition-colors"
            title="Previous Page"
          >
            <ChevronLeft size={14} />
          </button>

          <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 transition-colors"
            title="Next Page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Title Detail Modal */}
      {activeModalTitle && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setActiveModalTitle(null)}
        >
          <div 
            className="glass-card-executive max-w-2xl w-full p-6 bg-slate-900 border border-slate-700/80 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModalTitle(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl border border-slate-700 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                activeModalTitle.type === 'Movie' 
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              }`}>
                {activeModalTitle.type}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
                {activeModalTitle.rating}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {activeModalTitle.release_year}
              </span>
            </div>

            <h3 className="text-xl font-black text-white tracking-tight mb-2">
              {activeModalTitle.title}
            </h3>

            <div className="flex flex-wrap items-center gap-4 py-3 my-2 border-y border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-accent" />
                <span>{activeModalTitle.duration}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-emerald-400" />
                <span>Added: {activeModalTitle.date_added}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe size={14} className="text-indigo-400" />
                <span>{activeModalTitle.country}</span>
              </div>
            </div>

            <div className="my-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Synopsis</p>
              <p className="text-sm text-slate-200 leading-relaxed">
                {activeModalTitle.description || 'No description available for this catalog entry.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Director</p>
                <p className="font-semibold text-white">{activeModalTitle.director}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Genres</p>
                <p className="font-semibold text-white">{activeModalTitle.genres}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Starring Cast</p>
              <p className="text-slate-300 leading-normal">{activeModalTitle.cast}</p>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent border border-primary/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <span className="font-semibold text-white">AI Content Fit Score</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">Retention Affinity:</span>
                <span className="font-bold text-emerald-400 text-sm">94.2%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
