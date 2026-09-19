import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ActiveFilterBar from './components/ActiveFilterBar';
import KpiRow from './components/KpiRow';
import RowTwoCharts from './components/RowTwoCharts';
import RowThreeCharts from './components/RowThreeCharts';
import RowFourCharts from './components/RowFourCharts';
import RowFiveCharts from './components/RowFiveCharts';
import DataTableSection from './components/DataTableSection';
import RightPanel from './components/RightPanel';
import ContentAnalyticsView from './components/ContentAnalyticsView';
import CatalogExplorerView from './components/CatalogExplorerView';
import SqlInsightsView from './components/SqlInsightsView';
import PredictiveAnalyticsView from './components/PredictiveAnalyticsView';
import AiInsightsView from './components/AiInsightsView';
import RecommendationsView from './components/RecommendationsView';
import SettingsView from './components/SettingsView';

import { FilterProvider, useDashboardFilter } from './context/FilterContext';
import analyticsData from './data/executiveAnalytics.json';

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

function DashboardInner() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const { filteredCatalog, computedAnalytics, isFiltered } = useDashboardFilter();

  // Global Excel Export reflecting current filtered slice
  const handleExportExcel = () => {
    const exportRows = filteredCatalog.slice(0, 5000).map(item => ({
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
    XLSX.utils.book_append_sheet(wb, ws, 'Catalog Performance');
    XLSX.writeFile(wb, `netflix_executive_data_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Global PDF Export reflecting current filtered slice
  const handleExportPdf = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42); // #0F172A
    doc.rect(0, 0, 210, 297, 'F');

    // Title
    doc.setTextColor(229, 9, 20); // Netflix Red
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('NETFLIX EXECUTIVE BI BRIEFING', 14, 22);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Global Catalog Performance & Retention Audit', 14, 30);
    doc.text(`Generated: ${new Date().toLocaleDateString()} · Filtered Scope: ${filteredCatalog.length.toLocaleString()} Titles`, 14, 36);

    // KPI Summary Box
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(14, 44, 182, 34, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('EXECUTIVE METRICS SUMMARY (ACTIVE SLICE)', 20, 54);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 210, 230);
    doc.setFontSize(9);
    const kpis = computedAnalytics?.kpis || analyticsData.kpis;
    const kpiSummary = `Total Titles: ${filteredCatalog.length.toLocaleString()}  |  Movies: ${kpis.moviesCount?.toLocaleString()}  |  TV Shows: ${kpis.tvCount?.toLocaleString()}`;
    doc.text(kpiSummary, 20, 62);
    doc.text(`Catalog Health Score: ${computedAnalytics?.executiveInsights?.healthScore || 88}/100  |  Global Production Markets: ${kpis.uniqueCountries || 121} Countries`, 20, 70);

    // Table Header
    let y = 92;
    doc.setFillColor(229, 9, 20);
    doc.rect(14, y - 6, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Title', 16, y);
    doc.text('Type', 75, y);
    doc.text('Rating', 105, y);
    doc.text('Year', 130, y);
    doc.text('Country', 155, y);

    // Sample Rows
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(220, 225, 235);
    const sample = filteredCatalog.slice(0, 18);
    sample.forEach((item, idx) => {
      y += 8.5;
      if (idx % 2 === 0) {
        doc.setFillColor(24, 33, 47);
        doc.rect(14, y - 6, 182, 8.5, 'F');
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
    doc.text('Confidential · Netflix Executive Business Intelligence Platform · Power BI Engine Telemetry', 14, 285);

    doc.save(`netflix_executive_briefing_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background text-textPrimary flex font-sans bg-executive-grid">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        healthScore={computedAnalytics?.executiveInsights?.healthScore || analyticsData.executiveInsights.healthScore}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky Top Bar */}
        <TopBar
          onExportPdf={handleExportPdf}
          onExportExcel={handleExportExcel}
          rightPanelOpen={rightPanelOpen}
          setRightPanelOpen={setRightPanelOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Scrollable Center Canvas + Slide-in Right Panel */}
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
            {/* Active Cross-Filtering Status Bar (Power BI Breadcrumbs & Chips) */}
            <ActiveFilterBar />

            {/* TAB 1: EXECUTIVE DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fade-in">
                {/* FIRST ROW: 6 KPI CARDS (Interactive, Power BI filterable) */}
                <KpiRow />

                {/* SECOND ROW: 3 CHARTS (Monthly Added, Movies vs TV Donut, Top Genres) */}
                <RowTwoCharts />

                {/* THIRD ROW: 3 CHARTS (World Map, Ratings Histogram, Duration Box Plot) */}
                <RowThreeCharts />

                {/* FOURTH ROW: 3 CHARTS (Release Trend, Year Wise Growth, Genre Heatmap) */}
                <RowFourCharts />

                {/* FIFTH ROW: 3 CHARTS (Top Directors, Top Actors Treemap, Regional Donut) */}
                <RowFiveCharts />

                {/* BOTTOM SECTION: INTERACTIVE DATA TABLE */}
                <DataTableSection />
              </div>
            )}

            {/* TAB 2: CONTENT ANALYTICS */}
            {activeTab === 'content' && (
              <ContentAnalyticsView analytics={computedAnalytics || analyticsData} />
            )}

            {/* TAB 3: CATALOG EXPLORER */}
            {activeTab === 'catalog' && (
              <CatalogExplorerView catalog={filteredCatalog} />
            )}

            {/* TAB 4: SQL INSIGHTS */}
            {activeTab === 'sql' && (
              <SqlInsightsView />
            )}

            {/* TAB 5: STRATEGIC RECOMMENDATIONS (Preserving original Recommendations route) */}
            {activeTab === 'recommendations' && (
              <RecommendationsView onNavigateSql={() => setActiveTab('sql')} />
            )}

            {/* TAB 6: PREDICTIVE ANALYTICS */}
            {activeTab === 'predictive' && (
              <PredictiveAnalyticsView />
            )}

            {/* TAB 7: AI INSIGHTS */}
            {activeTab === 'ai' && (
              <AiInsightsView />
            )}

            {/* TAB 8: SETTINGS */}
            {activeTab === 'settings' && (
              <SettingsView />
            )}
          </main>

          {/* RIGHT PANEL: AI Strategic Advisory Drawer */}
          <RightPanel
            isOpen={rightPanelOpen}
            onClose={() => setRightPanelOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <FilterProvider>
      <DashboardInner />
    </FilterProvider>
  );
}
