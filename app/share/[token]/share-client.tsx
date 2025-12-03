"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Activity,
  Clock,
  TrendingUp,
  Eye,
  Globe,
  Share2,
  BarChart3,
  RefreshCw,
  MousePointer,
  Monitor,
  Chrome,
  ExternalLink,
  MapPin,
  Smartphone,
  TrendingDown,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

interface SharePageClientProps {
  campaign: any;
  token: string;
}

type TabType = 'traffic' | 'geographic' | 'technology';

export default function SharePageClient({ campaign, token }: SharePageClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('traffic');
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<string>('7d');
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const fetchMetrics = async () => {
    // Don't clear metrics during loading to prevent graph showing 0
    setLoading(true);
    setError(null);
    try {
      let url = `/api/share/${token}/metrics?range=${dateRange}&_t=${Date.now()}`;
      
      // Add custom dates if using custom range
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        url += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      }
      
      console.log('Fetching metrics with URL:', url, 'dateRange:', dateRange);
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error("Failed to fetch metrics");
      }
      const data = await response.json();
      console.log("Fetched metrics data:", data);
      setMetrics(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to load analytics data");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered - dateRange:', dateRange, 'token:', token);
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token, dateRange, customStartDate, customEndDate, refetchTrigger]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside both the trigger button AND the dropdown panel
      if (showCustomRange && !target.closest('.date-range-dropdown') && !target.closest('.date-range-dropdown-panel')) {
        setShowCustomRange(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCustomRange]);

  const handleDateRangeChange = (range: string) => {
    console.log('handleDateRangeChange called with:', range);
    console.log('Current dateRange before update:', dateRange);
    setDateRange(range);
    console.log('setDateRange called with:', range);
    setShowCustomRange(false); // Always close dropdown after selection
    
    // Force a small delay to log the updated state
    setTimeout(() => {
      console.log('dateRange after setState (delayed check):', dateRange);
    }, 100);
  };

  const toggleDropdown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!showCustomRange) {
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX
      });
    }
    setShowCustomRange(!showCustomRange);
  };

  const applyCustomRange = () => {
    if (customStartDate && customEndDate) {
      fetchMetrics();
    }
  };

  const getDateRangeLabel = () => {
    switch(dateRange) {
      case '1d': return 'Last Day';
      case '3d': return 'Last 3 Days';
      case '7d': return 'Last 7 Days';
      case '14d': return 'Last 14 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      case 'custom': return customStartDate && customEndDate ? `${customStartDate} to ${customEndDate}` : 'Custom Range';
      default: return 'Last 7 Days';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{campaign.name}</h1>
              {campaign.description && (
                <p className="text-slate-400 text-lg">{campaign.description}</p>
              )}
            </div>
            <button
              onClick={fetchMetrics}
              disabled={loading}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-900/30 text-emerald-400 rounded-full text-sm font-medium">
              <BarChart3 className="w-4 h-4" />
              {campaign.integrations?.platform_name || "Google Analytics"}
            </span>
            
            {/* Date Range Selector */}
            <div className="relative date-range-dropdown z-50">
              <button
                onClick={toggleDropdown}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-all"
              >
                <Calendar className="w-4 h-4" />
                {getDateRangeLabel()}
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            
            <span className="text-slate-500 text-sm">
              {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-2 mb-6 relative z-10">
          <div className="flex gap-2">
            <TabButton
              active={activeTab === 'traffic'}
              onClick={() => setActiveTab('traffic')}
              icon={<TrendingUp className="w-4 h-4" />}
              label="Traffic & Engagement"
            />
            <TabButton
              active={activeTab === 'geographic'}
              onClick={() => setActiveTab('geographic')}
              icon={<Globe className="w-4 h-4" />}
              label="Geographic"
            />
            <TabButton
              active={activeTab === 'technology'}
              onClick={() => setActiveTab('technology')}
              icon={<Monitor className="w-4 h-4" />}
              label="Device & Tech"
            />
          </div>
        </div>

        {/* Error State */}
        {error && !metrics && (
          <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchMetrics}
              className="mt-4 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Tab Content - Always show if we have metrics, with loading overlay if refreshing */}
        {metrics && (
          <div className="relative">
            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm rounded-2xl z-20 flex items-center justify-center">
                <div className="bg-slate-800 px-6 py-4 rounded-lg border border-slate-700 flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                  <p className="text-slate-300">Updating data...</p>
                </div>
              </div>
            )}
            
            {/* Tab Content */}
            {activeTab === 'traffic' && <TrafficTab metrics={metrics} dateRange={dateRange} />}
            {activeTab === 'geographic' && <GeographicTab metrics={metrics} dateRange={dateRange} />}
            {activeTab === 'technology' && <TechnologyTab metrics={metrics} dateRange={dateRange} />}
          </div>
        )}

        {/* Initial Loading State - only shown when no metrics exist yet */}
        {!metrics && !error && (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading analytics data...</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm mt-8">
          <p>🔒 Powered by Web Analytics Verifier • Real-time data from Google Analytics</p>
          <p className="mt-1">Data is fetched directly from GA4 and cannot be manipulated</p>
        </div>
      </div>

      {/* Date Range Dropdown Portal - Rendered outside main container */}
      {showCustomRange && (
        <div 
          className="date-range-dropdown-panel fixed bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4 min-w-[320px] z-9999"
          style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
        >
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDateRangeChange('1d');
              }} 
              className={`px-3 py-2 rounded-lg text-sm transition-all ${dateRange === '1d' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              Last Day
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDateRangeChange('3d');
              }} 
              className={`px-3 py-2 rounded-lg text-sm transition-all ${dateRange === '3d' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              Last 3 Days
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDateRangeChange('7d');
              }} 
              className={`px-3 py-2 rounded-lg text-sm transition-all ${dateRange === '7d' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              Last 7 Days
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDateRangeChange('14d');
              }} 
              className={`px-3 py-2 rounded-lg text-sm transition-all ${dateRange === '14d' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              Last 14 Days
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDateRangeChange('30d');
              }} 
              className={`px-3 py-2 rounded-lg text-sm transition-all ${dateRange === '30d' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              Last 30 Days
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDateRangeChange('90d');
              }} 
              className={`px-3 py-2 rounded-lg text-sm transition-all ${dateRange === '90d' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              Last 90 Days
            </button>
          </div>
          
          <div className="border-t border-slate-700 pt-4">
            <p className="text-slate-400 text-xs mb-3 font-medium">Custom Date Range</p>
            <div className="space-y-3">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  max={new Date().toISOString().split('T')[0]}
                  min={customStartDate}
                />
              </div>
              <button
                onClick={() => {
                  handleDateRangeChange('custom');
                  applyCustomRange();
                }}
                disabled={!customStartDate || !customEndDate}
                className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-all"
              >
                Apply Custom Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
        active
          ? 'bg-linear-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function TrafficTab({ metrics, dateRange }: { metrics: any; dateRange: string }) {
  console.log('TrafficTab rendered with dateRange:', dateRange);
  console.log('metrics.metrics.rows count:', metrics?.metrics?.rows?.length);
  console.log('totalMetrics:', metrics?.totalMetrics);
  
  // Calculate totals from aggregated API response (not from summing time-series data)
  const calculateTotals = () => {
    // For '1d' range, we need to sum only the last 24 hours from time-series data
    // because totalMetrics gives us yesterday+today combined
    if (dateRange === '1d' && metrics?.metrics?.rows) {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      
      let totalUsers = 0, totalSessions = 0, newUsers = 0;
      let weightedDuration = 0, weightedBounceRate = 0, weightedPagesPerSession = 0, weightedEngagementRate = 0;
      let engagedSessions = 0, eventCount = 0;
      
      metrics.metrics.rows.forEach((row: any) => {
        const dateStr = row.dimensionValues[0]?.value || '';
        // Parse YYYYMMDDHH format
        if (dateStr.length === 10) {
          const year = parseInt(dateStr.substring(0, 4));
          const month = parseInt(dateStr.substring(4, 6)) - 1;
          const day = parseInt(dateStr.substring(6, 8));
          const hour = parseInt(dateStr.substring(8, 10));
          const rowDate = new Date(year, month, day, hour);
          
          // Only include if within last 24 hours
          if (rowDate >= twentyFourHoursAgo) {
            const sessions = parseInt(row.metricValues[1]?.value || 0);
            const duration = parseFloat(row.metricValues[2]?.value || 0);
            const bounceRate = parseFloat(row.metricValues[3]?.value || 0);
            const engagementRate = parseFloat(row.metricValues[6]?.value || 0);
            const pagesPerSession = parseFloat(row.metricValues[8]?.value || 0);
            
            totalUsers += parseInt(row.metricValues[0]?.value || 0);
            totalSessions += sessions;
            newUsers += parseInt(row.metricValues[5]?.value || 0);
            engagedSessions += parseInt(row.metricValues[7]?.value || 0);
            eventCount += parseInt(row.metricValues[9]?.value || 0);
            
            // Weighted averages based on sessions
            weightedDuration += duration * sessions;
            weightedBounceRate += bounceRate * sessions;
            weightedEngagementRate += engagementRate * sessions;
            weightedPagesPerSession += pagesPerSession * sessions;
          }
        }
      });
      
      const result = {
        totalUsers,
        totalSessions,
        newUsers,
        returningUsers: totalUsers - newUsers,
        engagementRate: totalSessions > 0 ? weightedEngagementRate / totalSessions : 0,
        avgDuration: totalSessions > 0 ? weightedDuration / totalSessions : 0,
        bounceRate: totalSessions > 0 ? weightedBounceRate / totalSessions : 0,
        pagesPerSession: totalSessions > 0 ? weightedPagesPerSession / totalSessions : 0,
        engagedSessions,
        eventCount,
      };
      
      console.log('Calculated totals from last 24h of time-series data:', result);
      return result;
    }
    
    // For other ranges, use the totalMetrics endpoint
    if (metrics?.totalMetrics?.rows?.[0]) {
      const row = metrics.totalMetrics.rows[0];
      const totalUsers = parseInt(row.metricValues[0]?.value || 0);
      const totalSessions = parseInt(row.metricValues[1]?.value || 0);
      const avgDuration = parseFloat(row.metricValues[2]?.value || 0);
      const bounceRate = parseFloat(row.metricValues[3]?.value || 0);
      const newUsers = parseInt(row.metricValues[5]?.value || 0);
      const engagementRate = parseFloat(row.metricValues[6]?.value || 0);
      const engagedSessions = parseInt(row.metricValues[7]?.value || 0);
      const pagesPerSession = parseFloat(row.metricValues[8]?.value || 0);
      const eventCount = parseInt(row.metricValues[9]?.value || 0);

      const result = {
        totalUsers,
        totalSessions,
        newUsers,
        returningUsers: totalUsers - newUsers,
        engagementRate,
        avgDuration,
        bounceRate,
        pagesPerSession,
        engagedSessions,
        eventCount,
      };
      
      console.log('Calculated totals from totalMetrics:', result);
      return result;
    }
    
    // Fallback to empty state
    return { totalUsers: 0, totalSessions: 0, newUsers: 0, returningUsers: 0, engagementRate: 0, avgDuration: 0, bounceRate: 0, pagesPerSession: 0, engagedSessions: 0, eventCount: 0 };
  };

  const totals = calculateTotals();

  // Filter breakdown data to last 24 hours when dateRange is '1d' and data includes dateHour dimension
  const filterBreakdownToLast24h = (breakdownData: any) => {
    if (!breakdownData || !breakdownData.rows || dateRange !== '1d') {
      return breakdownData;
    }
    
    // Check if data includes time dimension (dateHour) - it will have 2 dimension values
    const hasTimeDimension = breakdownData.rows[0]?.dimensionValues?.length > 1;
    
    if (!hasTimeDimension) {
      return breakdownData;
    }
    
    // Filter and aggregate rows to last 24 hours
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    
    // Aggregate by first dimension (e.g., channel, source, etc.)
    const aggregated = new Map<string, number>();
    
    breakdownData.rows.forEach((row: any) => {
      const dimensionValue = row.dimensionValues[0]?.value;
      const dateHourValue = row.dimensionValues[1]?.value; // dateHour is second dimension
      const metricValue = parseInt(row.metricValues[0]?.value || 0);
      
      // Parse YYYYMMDDHH format
      if (dateHourValue && dateHourValue.length === 10) {
        const year = parseInt(dateHourValue.substring(0, 4));
        const month = parseInt(dateHourValue.substring(4, 6)) - 1;
        const day = parseInt(dateHourValue.substring(6, 8));
        const hour = parseInt(dateHourValue.substring(8, 10));
        const rowDate = new Date(year, month, day, hour);
        
        // Only include if within last 24 hours
        if (rowDate >= twentyFourHoursAgo) {
          const currentValue = aggregated.get(dimensionValue) || 0;
          aggregated.set(dimensionValue, currentValue + metricValue);
        }
      }
    });
    
    // Convert back to GA4 format and sort by metric value
    const filteredRows = Array.from(aggregated.entries())
      .map(([dimension, metric]) => ({
        dimensionValues: [{ value: dimension }],
        metricValues: [{ value: metric.toString() }]
      }))
      .sort((a, b) => parseInt(b.metricValues[0].value) - parseInt(a.metricValues[0].value));
    
    return {
      ...breakdownData,
      rows: filteredRows
    };
  };

  // Apply filtering to breakdown data
  const filteredChannelGroup = filterBreakdownToLast24h(metrics?.channelGroup);
  const filteredSources = filterBreakdownToLast24h(metrics?.sources);
  const filteredMedium = filterBreakdownToLast24h(metrics?.medium);
  const filteredReferrers = filterBreakdownToLast24h(metrics?.referrers);
  const filteredSocial = filterBreakdownToLast24h(metrics?.social);
  const filteredPageTitles = filterBreakdownToLast24h(metrics?.pageTitles);

  // Helper function to parse different GA4 date formats
  const parseGA4Date = (dateStr: string) => {
    if (!dateStr) return new Date();
    
    // YYYYMMDD format (8 chars)
    if (dateStr.length === 8) {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      return new Date(`${year}-${month}-${day}`);
    }
    
    // YYYYMMDDHH format (10 chars) - dateHour
    if (dateStr.length === 10) {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      const hour = dateStr.substring(8, 10);
      return new Date(`${year}-${month}-${day}T${hour}:00:00`);
    }
    
    // YYYYMMDDHHmm format (12 chars) - dateHourMinute
    if (dateStr.length === 12) {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      const hour = dateStr.substring(8, 10);
      const minute = dateStr.substring(10, 12);
      return new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
    }
    
    return new Date(dateStr);
  };

  // Helper function to format date based on granularity
  const formatChartDate = (dateStr: string) => {
    const parsedDate = parseGA4Date(dateStr);
    
    // For hour/minute level data, show time
    if (dateStr.length >= 10) {
      return parsedDate.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric',
        minute: dateStr.length === 12 ? 'numeric' : undefined
      });
    }
    
    // For day level data, show date only
    return parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Prepare chart data - Parse GA4 date format and fill missing dates
  const prepareChartDataWithAllDates = () => {
    if (!metrics?.metrics?.rows) return [];
    
    console.log('Raw metrics.metrics.rows:', metrics.metrics.rows);
    
    // Parse existing data from GA4
    const dataMap = new Map<string, number>();
    let totalFromRows = 0;
    metrics.metrics.rows.forEach((row: any) => {
      const date = row.dimensionValues[0]?.value || '';
      const sessions = parseInt(row.metricValues[1]?.value || 0);
      dataMap.set(date, sessions);
      totalFromRows += sessions;
    });
    
    console.log('Sum of all sessions from time-series rows:', totalFromRows);
    console.log('Total sessions from totalMetrics API:', metrics?.totalMetrics?.rows?.[0]?.metricValues?.[1]?.value);
    
    // Determine granularity from dateRange prop (not from data format)
    const isHourly = dateRange === '1d';
    const isMinutely = false; // We removed 1h option
    
    // Generate all dates in range
    const result = [];
    const now = new Date();
    
    // Determine number of periods based on range
    let periods = 7; // default
    
    console.log('prepareChartDataWithAllDates - dateRange:', dateRange);
    
    if (dateRange === '1h') periods = 60; // 60 minutes
    else if (dateRange === '1d') periods = 24; // 24 hours
    else if (dateRange === '3d') periods = 3;
    else if (dateRange === '7d') periods = 7;
    else if (dateRange === '14d') periods = 14;
    else if (dateRange === '30d') periods = 30;
    else if (dateRange === '90d') periods = 90;
    
    // Generate dates/times
    for (let i = periods - 1; i >= 0; i--) {
      let dateStr = '';
      let displayDate = '';
      
      if (isMinutely) {
        // Minute level
        const date = new Date(now.getTime() - (i * 60 * 1000));
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        dateStr = `${year}${month}${day}${hour}${minute}`;
        displayDate = date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
      } else if (isHourly) {
        // Hour level - show last 24 hours going backwards from now
        const date = new Date(now.getTime() - (i * 60 * 60 * 1000));
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        dateStr = `${year}${month}${day}${hour}`;
        displayDate = date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' });
      } else {
        // Day level
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        dateStr = `${year}${month}${day}`;
        displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      result.push({
        date: displayDate,
        sessions: dataMap.get(dateStr) || 0,
      });
    }
    
    return result;
  };
  
  const chartData = prepareChartDataWithAllDates();
  
  console.log('Chart data prepared:', chartData.length, 'data points', chartData);

  // Prepare user activity chart data with all dates
  const prepareUserActivityDataWithAllDates = () => {
    if (!metrics?.userActivity?.rows) return [];
    
    // Parse existing data from GA4
    const dataMap = new Map<string, { activeUsers: number; newUsers: number }>();
    metrics.userActivity.rows.forEach((row: any) => {
      const date = row.dimensionValues[0]?.value || '';
      const activeUsers = parseInt(row.metricValues[0]?.value || 0);
      const newUsers = parseInt(row.metricValues[1]?.value || 0);
      dataMap.set(date, { activeUsers, newUsers });
    });
    
    // Determine granularity from dateRange prop (not from data format)
    const isHourly = dateRange === '1d';
    const isMinutely = false; // We removed 1h option
    
    // Generate all dates in range
    const result = [];
    const now = new Date();
    
    // Determine number of periods based on range
    let periods = 7; // default
    
    if (dateRange === '1h') periods = 60;
    else if (dateRange === '1d') periods = 24;
    else if (dateRange === '3d') periods = 3;
    else if (dateRange === '7d') periods = 7;
    else if (dateRange === '14d') periods = 14;
    else if (dateRange === '30d') periods = 30;
    else if (dateRange === '90d') periods = 90;
    
    // Generate dates/times
    for (let i = periods - 1; i >= 0; i--) {
      let dateStr = '';
      let displayDate = '';
      
      if (isMinutely) {
        const date = new Date(now.getTime() - (i * 60 * 1000));
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        dateStr = `${year}${month}${day}${hour}${minute}`;
        displayDate = date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
      } else if (isHourly) {
        const date = new Date(now.getTime() - (i * 60 * 60 * 1000));
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        dateStr = `${year}${month}${day}${hour}`;
        displayDate = date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' });
      } else {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        dateStr = `${year}${month}${day}`;
        displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      const data = dataMap.get(dateStr);
      result.push({
        date: displayDate,
        activeUsers: data?.activeUsers || 0,
        newUsers: data?.newUsers || 0,
      });
    }
    
    return result;
  };
  
  const userActivityChartData = prepareUserActivityDataWithAllDates();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          icon={<Activity className="w-6 h-6" />}
          label="Total Sessions"
          value={totals.totalSessions.toLocaleString()}
          color="emerald"
        />
        <MetricCard
          icon={<Users className="w-6 h-6" />}
          label="Active Users"
          value={totals.totalUsers.toLocaleString()}
          color="blue"
        />
        <MetricCard
          icon={<Eye className="w-6 h-6" />}
          label="New Users"
          value={totals.newUsers.toLocaleString()}
          subtext={`${(totals.returningUsers || 0).toLocaleString()} returning`}
          color="purple"
        />
        <MetricCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Engagement Rate"
          value={`${(totals.engagementRate * 100).toFixed(1)}%`}
          color="cyan"
        />
        <MetricCard
          icon={<BarChart3 className="w-6 h-6" />}
          label="Event Count"
          value={totals.eventCount.toLocaleString()}
          color="amber"
        />
      </div>

      {/* User Activity Chart */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          User Activity Over Time
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userActivityChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="activeUsers" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} name="Active Users" />
              <Line type="monotone" dataKey="newUsers" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7', r: 3 }} name="New Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions by Channel Group */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            Sessions by Channel Group
          </h2>
          <div className="space-y-3">
            {filteredChannelGroup?.rows?.map((row: any, index: number) => {
              const channel = row.dimensionValues[0]?.value || "Unknown";
              const sessions = parseInt(row.metricValues[0]?.value || 0);
              const maxSessions = parseInt(filteredChannelGroup.rows[0]?.metricValues[0]?.value || 1);
              const percentage = (sessions / maxSessions) * 100;

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 text-sm">{channel}</span>
                    <span className="text-emerald-400 font-semibold text-sm">{sessions}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Session Medium */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-blue-400" />
            Traffic Sources
          </h2>
          <div className="space-y-3">
            {filteredSources?.rows?.slice(0, 7).map((row: any, index: number) => {
              const source = row.dimensionValues[0]?.value || "Unknown";
              const sessions = parseInt(row.metricValues[0]?.value || 0);

              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">{source}</span>
                  <span className="text-blue-400 font-semibold text-sm">{sessions}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Engagement */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            User Engagement
          </h2>
          <div className="space-y-4">
            <div>
              <div className="text-slate-400 text-sm mb-1">Avg. Session Duration</div>
              <div className="text-2xl font-bold text-white">{Math.floor(totals.avgDuration / 60)}m {Math.floor(totals.avgDuration % 60)}s</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-1">Bounce Rate</div>
              <div className="text-2xl font-bold text-white">{(totals.bounceRate * 100).toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-1">Pages / Session</div>
              <div className="text-2xl font-bold text-white">{totals.pagesPerSession.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-1">Engaged Sessions</div>
              <div className="text-2xl font-bold text-white">{totals.engagedSessions.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Referrers and Pages Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views by Page Title */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-400" />
            Views by Page Title
          </h2>
          <div className="space-y-3">
            {filteredPageTitles?.rows && filteredPageTitles.rows.length > 0 ? (
              filteredPageTitles.rows.slice(0, 10).map((row: any, index: number) => {
                const pageTitle = row.dimensionValues[0]?.value || "Unknown";
                const views = parseInt(row.metricValues[0]?.value || 0);

                return (
                  <div key={index} className="flex items-center justify-between gap-3">
                    <span className="text-slate-300 text-sm truncate flex-1">{pageTitle}</span>
                    <span className="text-emerald-400 font-semibold text-sm whitespace-nowrap">{views}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-500 text-sm">No page view data available</p>
            )}
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-pink-400" />
            Social Referrers
          </h2>
          <div className="space-y-3">
            {filteredSocial?.rows && filteredSocial.rows.length > 0 ? (
              filteredSocial.rows.slice(0, 5).map((row: any, index: number) => {
                const social = row.dimensionValues[0]?.value || "Unknown";
                const users = parseInt(row.metricValues[0]?.value || 0);

                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">{social}</span>
                    <span className="text-pink-400 font-semibold text-sm">{users}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-500 text-sm">No social referrer data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Referrers Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-emerald-400" />
            Top Referrers
          </h2>
          <div className="space-y-3">
            {filteredReferrers?.rows && filteredReferrers.rows.length > 0 ? (
              filteredReferrers.rows.slice(0, 5).map((row: any, index: number) => {
                const referrer = row.dimensionValues[0]?.value || "Unknown";
                const users = parseInt(row.metricValues[0]?.value || 0);

                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm truncate max-w-[250px]">{referrer}</span>
                    <span className="text-emerald-400 font-semibold text-sm">{users}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-500 text-sm">No referrer data available</p>
            )}
          </div>
        </div>

        {/* Traffic Medium */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Traffic Medium
          </h2>
          <div className="space-y-3">
            {filteredMedium?.rows?.slice(0, 7).map((row: any, index: number) => {
              const medium = row.dimensionValues[0]?.value || "Unknown";
              const sessions = parseInt(row.metricValues[1]?.value || 0);

              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm capitalize">{medium}</span>
                  <span className="text-cyan-400 font-semibold text-sm">{sessions}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Traffic Sources Engagement Section - Full Width */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-400" />
          Traffic Sources Engagement
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Source</th>
                <th className="text-right py-3 px-4 text-slate-400 text-sm font-medium">Users</th>
                <th className="text-right py-3 px-4 text-slate-400 text-sm font-medium">Sessions</th>
                <th className="text-right py-3 px-4 text-slate-400 text-sm font-medium">Bounce Rate</th>
                <th className="text-right py-3 px-4 text-slate-400 text-sm font-medium">Avg Duration</th>
                <th className="text-right py-3 px-4 text-slate-400 text-sm font-medium">Pages/Session</th>
                <th className="text-right py-3 px-4 text-slate-400 text-sm font-medium">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {filteredSources?.rows && filteredSources.rows.length > 0 ? (
                filteredSources.rows.slice(0, 10).map((row: any, index: number) => {
                  const source = row.dimensionValues[0]?.value || "Unknown";
                  const users = parseInt(row.metricValues[0]?.value || 0);
                  const sessions = parseInt(row.metricValues[1]?.value || 0);
                  const bounceRate = parseFloat(row.metricValues[2]?.value || 0);
                  const avgDuration = parseFloat(row.metricValues[3]?.value || 0);
                  const pagesPerSession = parseFloat(row.metricValues[4]?.value || 0);
                  const engagementRate = parseFloat(row.metricValues[5]?.value || 0);

                  return (
                    <tr key={index} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-200 text-sm font-medium">{source}</td>
                      <td className="py-3 px-4 text-right text-emerald-400 text-sm font-semibold">{users.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-slate-300 text-sm">{sessions.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-sm">
                        <span className={`${bounceRate > 0.7 ? 'text-red-400' : bounceRate > 0.4 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {(bounceRate * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300 text-sm">
                        {Math.floor(avgDuration / 60)}m {Math.floor(avgDuration % 60)}s
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300 text-sm">{pagesPerSession.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-sm">
                        <span className={`${engagementRate > 0.7 ? 'text-green-400' : engagementRate > 0.4 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {(engagementRate * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-sm">
                    No traffic source data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function GeographicTab({ metrics, dateRange }: { metrics: any; dateRange: string }) {
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Filter breakdown data to last 24 hours when dateRange is '1d'
  const filterBreakdownToLast24h = (breakdownData: any) => {
    if (!breakdownData || !breakdownData.rows || dateRange !== '1d') {
      return breakdownData;
    }
    
    const hasTimeDimension = breakdownData.rows[0]?.dimensionValues?.length > 1;
    if (!hasTimeDimension) return breakdownData;
    
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const aggregated = new Map<string, number>();
    
    breakdownData.rows.forEach((row: any) => {
      const dimensionValue = row.dimensionValues[0]?.value;
      const dateHourValue = row.dimensionValues[1]?.value;
      const metricValue = parseInt(row.metricValues[0]?.value || 0);
      
      if (dateHourValue && dateHourValue.length === 10) {
        const year = parseInt(dateHourValue.substring(0, 4));
        const month = parseInt(dateHourValue.substring(4, 6)) - 1;
        const day = parseInt(dateHourValue.substring(6, 8));
        const hour = parseInt(dateHourValue.substring(8, 10));
        const rowDate = new Date(year, month, day, hour);
        
        if (rowDate >= twentyFourHoursAgo) {
          const currentValue = aggregated.get(dimensionValue) || 0;
          aggregated.set(dimensionValue, currentValue + metricValue);
        }
      }
    });
    
    const filteredRows = Array.from(aggregated.entries())
      .map(([dimension, metric]) => ({
        dimensionValues: [{ value: dimension }],
        metricValues: [{ value: metric.toString() }]
      }))
      .sort((a, b) => parseInt(b.metricValues[0].value) - parseInt(a.metricValues[0].value));
    
    return { ...breakdownData, rows: filteredRows };
  };
  
  const filteredCountries = filterBreakdownToLast24h(metrics?.countries);
  const filteredCities = filterBreakdownToLast24h(metrics?.cities);
  const filteredRegions = filterBreakdownToLast24h(metrics?.regions);
  const filteredContinents = filterBreakdownToLast24h(metrics?.continents);
  const filteredLanguages = filterBreakdownToLast24h(metrics?.languages);
  
  const totalUsers = filteredCountries?.rows?.reduce((sum: number, row: any) => sum + parseInt(row.metricValues[0]?.value || 0), 0) || 0;
  const totalCountries = filteredCountries?.rows?.length || 0;
  const totalCities = filteredCities?.rows?.length || 0;
  
  // Prepare data for geographic visualization
  const countryData = filteredCountries?.rows?.map((row: any) => ({
    country: row.dimensionValues[0]?.value || "Unknown",
    users: parseInt(row.metricValues[0]?.value || 0),
    percentage: ((parseInt(row.metricValues[0]?.value || 0) / totalUsers) * 100).toFixed(1)
  })) || [];
  
  // Country name mapping to match GA4 names with map geography names
  const countryNameMap: Record<string, string> = {
    'united states': 'united states of america',
    'usa': 'united states of america',
    'uk': 'united kingdom',
    'czechia': 'czech republic',
    'turkey': 'turkey',
    'south korea': 'republic of korea',
    'north korea': 'north korea',
    'vietnam': 'vietnam',
    'russia': 'russia',
    'tanzania': 'united republic of tanzania',
    'bolivia': 'bolivia',
    'venezuela': 'venezuela',
    'iran': 'iran',
    'syria': 'syria',
    'laos': 'laos',
    'congo': 'democratic republic of the congo',
    'republic of the congo': 'republic of the congo',
    'ivory coast': 'ivory coast',
    'macedonia': 'north macedonia',
  };
  
  // Normalize country name for matching
  const normalizeCountryName = (name: string): string => {
    const lower = name.toLowerCase().trim();
    return countryNameMap[lower] || lower;
  };
  
  // Create a map of country names to user counts for the map visualization
  const countryUserMap = new Map(
    countryData.map((c: any) => [normalizeCountryName(c.country), c.users])
  );
  
  const maxUsers = Math.max(...countryData.map((c: any) => c.users), 1);
  
  // Function to get color based on user count
  const getCountryColor = (countryName: string) => {
    // Filter out French overseas territories
    const isFrenchTerritory = countryName === 'French Guiana' || 
                            countryName === 'French Southern and Antarctic Lands' ||
                            countryName === 'New Caledonia' ||
                            countryName === 'French Polynesia';
    
    if (isFrenchTerritory) return '#1e293b'; // Keep territories gray
    
    const normalizedName = normalizeCountryName(countryName);
    const users = (countryUserMap.get(normalizedName) || 0) as number;
    if (users === 0) return '#1e293b'; // slate-800 for countries with no data
    
    const intensity = users / maxUsers;
    if (intensity > 0.7) return '#10b981'; // emerald-500
    if (intensity > 0.4) return '#34d399'; // emerald-400
    if (intensity > 0.2) return '#6ee7b7'; // emerald-300
    return '#a7f3d0'; // emerald-200
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<Globe className="w-6 h-6" />}
          label="Total Countries"
          value={totalCountries.toString()}
          color="emerald"
        />
        <MetricCard
          icon={<MapPin className="w-6 h-6" />}
          label="Total Cities"
          value={totalCities.toString()}
          color="blue"
        />
        <MetricCard
          icon={<Users className="w-6 h-6" />}
          label="Total Users"
          value={totalUsers.toLocaleString()}
          color="purple"
        />
        <MetricCard
          icon={<Globe className="w-6 h-6" />}
          label="Continents"
          value={(filteredContinents?.rows?.length || 0).toString()}
          color="cyan"
        />
      </div>

      {/* World Map Visualization */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-400" />
          Global User Distribution
        </h2>
        <div className="w-full relative" style={{ height: '500px' }}>
          <ComposableMap
            projectionConfig={{
              scale: 147,
            }}
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            <ZoomableGroup>
              <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                {({ geographies }: any) =>
                  geographies.map((geo: any) => {
                    const countryName = geo.properties.name;
                    const normalizedName = normalizeCountryName(countryName);
                    const users = (countryUserMap.get(normalizedName) || 0) as number;
                    
                    // Filter out France's overseas territories
                    const isFrenchTerritory = countryName === 'French Guiana' || 
                                            countryName === 'French Southern and Antarctic Lands' ||
                                            countryName === 'New Caledonia' ||
                                            countryName === 'French Polynesia';
                    
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={getCountryColor(countryName)}
                        stroke="#0f172a"
                        strokeWidth={0.5}
                        onMouseEnter={(e: any) => {
                          if (users > 0 && !isFrenchTerritory) {
                            const displayName = countryData.find((c: any) => normalizeCountryName(c.country) === normalizedName)?.country || countryName;
                            setTooltipContent(`${displayName}: ${users} users`);
                            setShowTooltip(true);
                          }
                        }}
                        onMouseMove={(e: any) => {
                          setTooltipPosition({ x: e.clientX, y: e.clientY });
                        }}
                        onMouseLeave={() => {
                          setShowTooltip(false);
                          setTooltipContent('');
                        }}
                        style={{
                          default: { outline: 'none' } as any,
                          hover: {
                            fill: users > 0 && !isFrenchTerritory ? '#059669' : '#1e293b',
                            outline: 'none',
                            cursor: users > 0 && !isFrenchTerritory ? 'pointer' : 'default'
                          } as any,
                          pressed: { outline: 'none' } as any
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-200"></div>
            <span className="text-slate-400">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-300"></div>
            <span className="text-slate-400">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-400"></div>
            <span className="text-slate-400">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-500"></div>
            <span className="text-slate-400">Very High</span>
          </div>
        </div>
      </div>

      {/* Tooltip - Rendered outside map container */}
      {showTooltip && tooltipContent && (
        <div
          className="fixed bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white shadow-xl pointer-events-none"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y + 10}px`,
            zIndex: 9999,
          }}
        >
          {tooltipContent}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Countries */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            Top Countries
          </h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {filteredCountries?.rows?.slice(0, 20).map((row: any, index: number) => {
              const country = row.dimensionValues[0]?.value || "Unknown";
              const users = parseInt(row.metricValues[0]?.value || 0);
              const percentage = ((users / totalUsers) * 100).toFixed(1);

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 text-sm">{country}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs">{percentage}%</span>
                      <span className="text-emerald-400 font-semibold text-sm">{users}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            Top Cities
          </h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {filteredCities?.rows?.slice(0, 20).map((row: any, index: number) => {
              const city = row.dimensionValues[0]?.value || "Unknown";
              const users = parseInt(row.metricValues[0]?.value || 0);

              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">{city}</span>
                  <span className="text-blue-400 font-semibold text-sm">{users}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Continents & Languages */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              Continents
            </h2>
            <div className="space-y-3">
              {filteredContinents?.rows?.map((row: any, index: number) => {
                const continent = row.dimensionValues[0]?.value || "Unknown";
                const users = parseInt(row.metricValues[0]?.value || 0);

                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">{continent}</span>
                    <span className="text-purple-400 font-semibold text-sm">{users}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              Top Languages
            </h2>
            <div className="space-y-3">
              {filteredLanguages?.rows?.slice(0, 8).map((row: any, index: number) => {
                const language = row.dimensionValues[0]?.value || "Unknown";
                const users = parseInt(row.metricValues[0]?.value || 0);

                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">{language}</span>
                    <span className="text-cyan-400 font-semibold text-sm">{users}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Regions */}
      {filteredRegions?.rows && filteredRegions.rows.length > 0 && (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            Top Regions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredRegions.rows.slice(0, 12).map((row: any, index: number) => {
              const region = row.dimensionValues[0]?.value || "Unknown";
              const users = parseInt(row.metricValues[0]?.value || 0);

              return (
                <div key={index} className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">{region}</div>
                  <div className="text-emerald-400 font-bold">{users}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TechnologyTab({ metrics, dateRange }: { metrics: any; dateRange: string }) {
  // Filter breakdown data to last 24 hours when dateRange is '1d'
  const filterBreakdownToLast24h = (breakdownData: any) => {
    if (!breakdownData || !breakdownData.rows || dateRange !== '1d') {
      return breakdownData;
    }
    
    const hasTimeDimension = breakdownData.rows[0]?.dimensionValues?.length > 1;
    if (!hasTimeDimension) return breakdownData;
    
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const aggregated = new Map<string, number>();
    
    breakdownData.rows.forEach((row: any) => {
      const dimensionValue = row.dimensionValues[0]?.value;
      const dateHourValue = row.dimensionValues[1]?.value;
      const metricValue = parseInt(row.metricValues[0]?.value || 0);
      
      if (dateHourValue && dateHourValue.length === 10) {
        const year = parseInt(dateHourValue.substring(0, 4));
        const month = parseInt(dateHourValue.substring(4, 6)) - 1;
        const day = parseInt(dateHourValue.substring(6, 8));
        const hour = parseInt(dateHourValue.substring(8, 10));
        const rowDate = new Date(year, month, day, hour);
        
        if (rowDate >= twentyFourHoursAgo) {
          const currentValue = aggregated.get(dimensionValue) || 0;
          aggregated.set(dimensionValue, currentValue + metricValue);
        }
      }
    });
    
    const filteredRows = Array.from(aggregated.entries())
      .map(([dimension, metric]) => ({
        dimensionValues: [{ value: dimension }],
        metricValues: [{ value: metric.toString() }]
      }))
      .sort((a, b) => parseInt(b.metricValues[0].value) - parseInt(a.metricValues[0].value));
    
    return { ...breakdownData, rows: filteredRows };
  };
  
  const filteredBrowsers = filterBreakdownToLast24h(metrics?.browsers);
  const filteredOs = filterBreakdownToLast24h(metrics?.os);
  const filteredDevices = filterBreakdownToLast24h(metrics?.devices);
  const filteredMobileDevices = filterBreakdownToLast24h(metrics?.mobileDevices);
  const filteredScreenResolution = filterBreakdownToLast24h(metrics?.screenResolution);
  
  // Calculate device percentages
  const deviceData = filteredDevices?.rows?.map((row: any) => ({
    name: row.dimensionValues[0]?.value || "Unknown",
    value: parseInt(row.metricValues[0]?.value || 0),
  })) || [];

  const totalDeviceUsers = deviceData.reduce((sum: number, d: { value: number }) => sum + d.value, 0);

  const COLORS = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {deviceData.slice(0, 3).map((device: { name: string; value: number; color: string }, index: number) => (
          <MetricCard
            key={index}
            icon={<Smartphone className="w-6 h-6" />}
            label={device.name}
            value={`${((device.value / totalDeviceUsers) * 100).toFixed(1)}%`}
            subtext={`${device.value.toLocaleString()} users`}
            color={index === 0 ? "emerald" : index === 1 ? "blue" : "purple"}
          />
        ))}
        <MetricCard
          icon={<Monitor className="w-6 h-6" />}
          label="Total Devices"
          value={totalDeviceUsers.toLocaleString()}
          color="cyan"
        />
      </div>

      {/* Device Category Chart */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-emerald-400" />
          Device Category Distribution
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${((entry.value / totalDeviceUsers) * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {deviceData.map((entry: { name: string; value: number; color: string }, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Browsers */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Chrome className="w-5 h-5 text-emerald-400" />
            Top Browsers
          </h2>
          <div className="space-y-3">
            {filteredBrowsers?.rows && filteredBrowsers.rows.length > 0 ? (
              filteredBrowsers.rows.slice(0, 10).map((row: any, index: number) => {
                const browser = row.dimensionValues[0]?.value || "Unknown";
                const users = parseInt(row.metricValues[0]?.value || 0);

                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">{browser}</span>
                    <span className="text-emerald-400 font-semibold text-sm">{users}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-500 text-sm">No browser data available</p>
            )}
          </div>
        </div>

        {/* Operating Systems */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-400" />
            Operating Systems
          </h2>
          <div className="space-y-3">
            {filteredOs?.rows && filteredOs.rows.length > 0 ? (
              filteredOs.rows.slice(0, 10).map((row: any, index: number) => {
                const os = row.dimensionValues[0]?.value || "Unknown";
                const users = parseInt(row.metricValues[0]?.value || 0);

                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">{os}</span>
                    <span className="text-blue-400 font-semibold text-sm">{users}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-500 text-sm">No OS data available</p>
            )}
          </div>
        </div>

        {/* Mobile Devices */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-purple-400" />
            Mobile Devices
          </h2>
          <div className="space-y-3">
            {filteredMobileDevices?.rows && filteredMobileDevices.rows.length > 0 ? (
              filteredMobileDevices.rows.slice(0, 10).map((row: any, index: number) => {
                const device = row.dimensionValues[0]?.value || "Unknown";
                const users = parseInt(row.metricValues[0]?.value || 0);

                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">{device}</span>
                    <span className="text-purple-400 font-semibold text-sm">{users}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-500 text-sm">No mobile device data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Screen Resolution */}
      {filteredScreenResolution?.rows && filteredScreenResolution.rows.length > 0 && (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-cyan-400" />
            Screen Resolutions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredScreenResolution.rows.slice(0, 12).map((row: any, index: number) => {
              const resolution = row.dimensionValues[0]?.value || "Unknown";
              const users = parseInt(row.metricValues[0]?.value || 0);

              return (
                <div key={index} className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">{resolution}</div>
                  <div className="text-cyan-400 font-bold">{users}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  subtext,
  color = "emerald",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    emerald: "text-emerald-400 bg-emerald-500/10",
    blue: "text-blue-400 bg-blue-500/10",
    purple: "text-purple-400 bg-purple-500/10",
    amber: "text-amber-400 bg-amber-500/10",
    cyan: "text-cyan-400 bg-cyan-500/10",
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl p-6">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-slate-400 mb-1">{label}</div>
      {subtext && <div className="text-xs text-slate-500">{subtext}</div>}
    </div>
  );
}
