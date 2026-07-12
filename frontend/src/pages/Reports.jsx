import { useState } from 'react';
import { useMockData } from '../context/MockDataContext';
import { useTheme } from '../context/ThemeContext';
import CostForecast from '../components/CostForecast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import { BarChart3, Download, Sparkles, Send, TrendingUp, PieChart as PieIcon, Coins, Activity, Settings2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Reports() {
  const { vehicles, trips, fuelLogs, expenses, maintenanceLogs } = useMockData();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Interactive Tabs
  const [activeTab, setActiveTab] = useState('financial'); // 'financial', 'fuel', 'ai'

  // Dynamic Chart Controls
  const [chartType, setChartType] = useState('area'); // 'area', 'bar', 'line'
  const [selectedRegion, setSelectedRegion] = useState('All'); // 'All', 'North', 'South', etc.
  
  // AI Insights state
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const aiSuggestions = [
    'Which vehicles are costing the most this month?',
    'Show me the maintenance logs summary.',
    'What is the current fleet utilization rate?',
    'Analyze overall operational costs.'
  ];

  // Indian Rupee formatting helper
  const formatRupees = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Convert USD to INR at standard rate of 83
  const CONVERSION_RATE = 83;

  // ----------------------------------------------------
  // REPORT AGGREGATION & DATA PREPARATION (INR)
  // ----------------------------------------------------
  
  // Calculate Fuel Efficiency per vehicle
  const vehicleFuelEfficiency = vehicles.map((v) => {
    const completedTrips = trips.filter((t) => t.vehicleId === v.id && t.status === 'Completed');
    const totalDistance = completedTrips.reduce((sum, t) => sum + (t.actualDistance || 0), 0);
    const totalFuel = completedTrips.reduce((sum, t) => sum + (t.fuelConsumed || 0), 0);
    
    return {
      name: v.nameModel,
      reg: v.registrationNumber,
      region: v.region,
      efficiency: totalFuel > 0 ? Number((totalDistance / totalFuel).toFixed(2)) : 0
    };
  }).filter(v => v.efficiency > 0 && (selectedRegion === 'All' || v.region === selectedRegion));

  // Calculate Operational Cost Breakdowns (Fuel, Maintenance, Tolls)
  const costBreakdownData = [
    {
      name: 'Fuel',
      value: Math.round(fuelLogs.reduce((sum, f) => sum + f.cost, 0) * CONVERSION_RATE),
      color: '#3b82f6'
    },
    {
      name: 'Maintenance',
      value: Math.round(maintenanceLogs.reduce((sum, m) => sum + m.cost, 0) * CONVERSION_RATE),
      color: '#f59e0b'
    },
    {
      name: 'Tolls & Other',
      value: Math.round(expenses.filter(e => e.type === 'Toll').reduce((sum, e) => sum + e.amount, 0) * CONVERSION_RATE),
      color: '#06b6d4'
    }
  ];

  // Calculate daily fuel cost trend for the line graph
  const dailyFuelTrend = fuelLogs.map(log => ({
    date: log.date,
    cost: log.cost * CONVERSION_RATE
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calculate Fleet Composition Type Distribution for the Pie Chart
  const fleetCompositionData = [
    { name: 'Vans', value: vehicles.filter(v => v.type === 'Van').length, color: '#6366f1' },
    { name: 'Trucks', value: vehicles.filter(v => v.type === 'Truck').length, color: '#10b981' }
  ];

  // Calculate ROI per vehicle in INR
  const vehicleROI = vehicles.map((v) => {
    const completedTrips = trips.filter((t) => t.vehicleId === v.id && t.status === 'Completed');
    const revenueUSD = completedTrips.reduce((sum, t) => sum + ((t.actualDistance || t.plannedDistance) * 4.5), 0);
    const fuelCostUSD = fuelLogs.filter((f) => f.vehicleId === v.id).reduce((sum, f) => sum + f.cost, 0);
    const maintenanceCostUSD = maintenanceLogs.filter((m) => m.vehicleId === v.id).reduce((sum, m) => sum + m.cost, 0);
    
    const opCostUSD = fuelCostUSD + maintenanceCostUSD;
    const netProfitUSD = revenueUSD - opCostUSD;
    
    const roiPercentage = v.acquisitionCost > 0 
      ? Number(((netProfitUSD / v.acquisitionCost) * 100).toFixed(2))
      : 0;

    return {
      name: v.nameModel,
      reg: v.registrationNumber,
      region: v.region,
      revenue: Math.round(revenueUSD * CONVERSION_RATE),
      opCost: Math.round(opCostUSD * CONVERSION_RATE),
      roi: roiPercentage
    };
  }).filter(v => selectedRegion === 'All' || v.region === selectedRegion);

  const handleCSVExport = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Vehicle Model,Registration,Region,Estimated Revenue (INR),Operational Cost (INR),ROI (%)\n';
    
    vehicleROI.forEach((v) => {
      csvContent += `"${v.name}","${v.reg}","${v.region}",${v.revenue},${v.opCost},${v.roi}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TransitOps_Fleet_ROI_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAISearch = async (queryStr) => {
    const query = queryStr || aiQuery;
    if (!query.trim()) return;

    setIsAiLoading(true);
    setAiQuery(query);
    setAiResponse(null);

    try {
      const token = localStorage.getItem('transitops_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const res = await fetch(`${API}/ai/fleet-insights`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query })
      });

      const data = await res.json();
      if (res.ok) {
        setAiResponse(data.answer);
      } else {
        setAiResponse(data.error || 'Failed to fetch AI insights.');
      }
    } catch (err) {
      setAiResponse('Cannot connect to the backend AI service.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const chartTooltipStyle = {
    backgroundColor: 'var(--bg-card)',
    borderColor: 'var(--border-color)',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-card)',
    padding: '10px 14px',
  };

  const chartLabelStyle = {
    color: 'var(--text-primary)',
    fontWeight: 'bold',
    fontSize: '12px',
    marginBottom: '4px'
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight font-display" style={{ color: 'var(--text-heading)' }}>Reports & Analytics</h2>
          <p className="text-sm text-slate-500 mt-0.5">View real-time efficiency dashboards, financial returns, and export compliance data in Indian Rupees (₹).</p>
        </div>
        <button
          onClick={handleCSVExport}
          className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
        >
          <Download className="h-4 w-4 mr-1.5" />
          Export Fleet ROI CSV
        </button>
      </div>

      {/* Fresh Tab Selector Row */}
      <div 
        className="flex p-1 rounded-xl w-full max-w-lg shadow-sm border"
        style={{ background: 'var(--bg-card-alt)', borderColor: 'var(--border-color)' }}
      >
        <button
          onClick={() => setActiveTab('financial')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'financial' ? 'text-white' : 'text-slate-500 hover:text-slate-400'
          }`}
          style={activeTab === 'financial' ? { background: '#2563eb', border: '1px solid var(--border-color)' } : {}}
        >
          <Coins className="h-4 w-4" />
          Financial ROI
        </button>
        <button
          onClick={() => setActiveTab('fuel')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'fuel' ? 'text-white' : 'text-slate-500 hover:text-slate-400'
          }`}
          style={activeTab === 'fuel' ? { background: '#2563eb', border: '1px solid var(--border-color)' } : {}}
        >
          <Activity className="h-4 w-4" />
          Fuel & Efficiency
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'ai' ? 'text-white' : 'text-slate-500 hover:text-slate-400'
          }`}
          style={activeTab === 'ai' ? { background: '#2563eb', border: '1px solid var(--border-color)' } : {}}
        >
          <Sparkles className="h-4 w-4" />
          AI Analyst Insights
        </button>
      </div>

      {/* Dynamic Graph / Controls Header */}
      {activeTab !== 'ai' && (
        <div 
          className="flex flex-wrap items-center justify-between p-4 rounded-xl border gap-4"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Chart Customization</span>
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Chart Type Selector */}
            {activeTab === 'financial' && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-label)' }}>Type</span>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="rounded-lg px-2.5 py-1 text-xs cursor-pointer select-base transition-all"
                  style={{ background: 'var(--bg-card-alt)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                  <option value="area">Area Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                </select>
              </div>
            )}

            {/* Region Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-label)' }}>Region</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="rounded-lg px-2.5 py-1 text-xs cursor-pointer select-base transition-all"
                style={{ background: 'var(--bg-card-alt)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                <option value="All">All Regions</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 1: Financial ROI Report ──────────────────────── */}
      {activeTab === 'financial' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Main Chart Card (2/3 width) */}
          <div
            className="lg:col-span-2 p-6 rounded-2xl flex flex-col h-[400px] shadow-sm"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <h3 className="text-xs font-bold uppercase tracking-widest font-display" style={{ color: 'var(--text-heading)' }}>
                  Vehicle ROI Rate Comparison (%)
                </h3>
              </div>
            </div>
            
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="95%">
                {chartType === 'area' ? (
                  <AreaChart data={vehicleROI} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="roiAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="reg" stroke="var(--text-muted)" style={{ fontSize: '10px' }} />
                    <YAxis stroke="var(--text-muted)" style={{ fontSize: '10px' }} />
                    <Tooltip contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={{ color: '#3b82f6', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="roi" name="ROI %" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#roiAreaGrad)" />
                  </AreaChart>
                ) : chartType === 'line' ? (
                  <LineChart data={vehicleROI} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="reg" stroke="var(--text-muted)" style={{ fontSize: '10px' }} />
                    <YAxis stroke="var(--text-muted)" style={{ fontSize: '10px' }} />
                    <Tooltip contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={{ color: '#3b82f6', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="roi" name="ROI %" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 6 }} />
                  </LineChart>
                ) : (
                  <BarChart data={vehicleROI} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="roiBarGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="reg" stroke="var(--text-muted)" style={{ fontSize: '10px' }} />
                    <YAxis stroke="var(--text-muted)" style={{ fontSize: '10px' }} />
                    <Tooltip contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={{ color: '#3b82f6', fontSize: '12px' }} />
                    <Bar dataKey="roi" name="ROI %" fill="url(#roiBarGrad)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fleet Vehicle Composition Pie Chart (1/3 width) */}
          <div
            className="p-6 rounded-2xl flex flex-col h-[400px] shadow-sm"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <PieIcon className="h-4 w-4 text-blue-500" />
              <h3 className="text-xs font-bold uppercase tracking-widest font-display" style={{ color: 'var(--text-heading)' }}>Fleet Composition</h3>
            </div>
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="95%">
                <PieChart>
                  <Pie
                    data={fleetCompositionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={true}
                    stroke="var(--bg-card)"
                    strokeWidth={2.5}
                  >
                    {fleetCompositionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    itemStyle={{ color: 'var(--text-primary)', fontSize: '12px' }}
                    formatter={(value) => `${value} Vehicles`}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconSize={10}
                    formatter={(value) => (
                      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cost Simulator Section below */}
          <div className="lg:col-span-3">
            <CostForecast />
          </div>

        </div>
      )}

      {/* ── Tab 2: Fuel & Carbon Efficiency Report ─────────────── */}
      {activeTab === 'fuel' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Left Chart: Fuel Efficiency Bar Chart */}
          <div
            className="p-6 rounded-2xl flex flex-col h-[400px] shadow-sm"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-blue-500" />
              <h3 className="text-xs font-bold uppercase tracking-widest font-display" style={{ color: 'var(--text-heading)' }}>
                Vehicle Fuel Efficiency (Distance / Fuel Consumed)
              </h3>
            </div>
            
            <div className="flex-1 min-h-0">
              {vehicleFuelEfficiency.length > 0 ? (
                <ResponsiveContainer width="100%" height="95%">
                  <BarChart data={vehicleFuelEfficiency} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="reg" stroke="var(--text-muted)" style={{ fontSize: '10px' }} />
                    <YAxis stroke="var(--text-muted)" style={{ fontSize: '10px' }} label={{ value: 'km/L', angle: -90, position: 'insideLeft', style: { fill: 'var(--text-muted)', fontSize: '10px' } }} />
                    <Tooltip contentStyle={chartTooltipStyle} labelStyle={chartLabelStyle} itemStyle={{ color: '#06b6d4', fontSize: '12px' }} />
                    <Bar dataKey="efficiency" name="Efficiency (km/L)" fill="url(#effGrad)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  No completed trip fuel usage logs match this region/filter.
                </div>
              )}
            </div>
          </div>

          {/* Right Chart: Fuel Expenditure Trend Line Chart */}
          <div
            className="p-6 rounded-2xl flex flex-col h-[400px] shadow-sm"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <h3 className="text-xs font-bold uppercase tracking-widest font-display" style={{ color: 'var(--text-heading)' }}>
                Fuel Expenditure Trend (₹)
              </h3>
            </div>
            
            <div className="flex-1 min-h-0">
              {dailyFuelTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="95%">
                  <LineChart data={dailyFuelTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" style={{ fontSize: '10px' }} />
                    <YAxis stroke="var(--text-muted)" style={{ fontSize: '10px' }} />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      labelStyle={chartLabelStyle}
                      itemStyle={{ color: '#06b6d4', fontSize: '12px' }}
                      formatter={(value) => formatRupees(value)}
                    />
                    <Line type="monotone" dataKey="cost" name="Fuel Cost" stroke="#06b6d4" strokeWidth={3} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  No fuel expenses found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3: AI Analyst Insights ───────────────────────── */}
      {activeTab === 'ai' && (
        <div
          className="p-6 rounded-2xl space-y-4 relative overflow-hidden shadow-sm animate-fade-in"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-600/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider font-display" style={{ color: 'var(--text-heading)' }}>AI Fleet Analyst Insights</h3>
          </div>
          <p className="text-xs text-slate-500">
            Ask questions in natural language about costs, efficiency, or ROI to receive immediate summaries based on active database logs.
          </p>

          {/* Input Bar */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Ask AI e.g. Which vehicles are costing the most this month?"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
              className="flex-1 rounded-xl px-4 py-3 text-xs transition-colors"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
            />
            <button
              onClick={() => handleAISearch()}
              className="p-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white shadow-lg transition-colors cursor-pointer active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2 pt-1">
            {aiSuggestions.map((pq, idx) => (
              <button
                key={idx}
                onClick={() => handleAISearch(pq)}
                className="text-[10px] px-2.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer border"
                style={{
                  background: 'var(--bg-card-alt)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.borderColor = 'var(--border-strong)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--bg-card-alt)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                {pq}
              </button>
            ))}
          </div>

          {/* AI Answer Box */}
          {(isAiLoading || aiResponse) && (
            <div
              className="p-4 rounded-xl space-y-2 mt-4 animate-fade-in border"
              style={{ background: 'var(--bg-card-alt)', borderColor: 'var(--border-color)' }}
            >
              {isAiLoading ? (
                <div className="flex items-center space-x-2 text-xs text-blue-500">
                  <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></span>
                  <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-100"></span>
                  <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-200"></span>
                  <span className="font-semibold">Analyst is scanning fleet ledgers...</span>
                </div>
              ) : (
                <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  <p dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
