import { useState } from 'react';
import { useMockData } from '../context/MockDataContext';
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
  Cell
} from 'recharts';
import { BarChart3, Download, Sparkles, Send, ShieldCheck, TrendingUp } from 'lucide-react';

export default function Reports() {
  const { vehicles, trips, fuelLogs, expenses, maintenanceLogs } = useMockData();
  
  // AI Insights state
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // ----------------------------------------------------
  // REPORT AGGREGATION & DATA PREPARATION
  // ----------------------------------------------------
  
  // Calculate Fuel Efficiency per vehicle
  // Formula: Distance / Fuel Consumed (km/L)
  const vehicleFuelEfficiency = vehicles.map((v) => {
    const completedTrips = trips.filter((t) => t.vehicleId === v.id && t.status === 'Completed');
    const totalDistance = completedTrips.reduce((sum, t) => sum + (t.actualDistance || 0), 0);
    const totalFuel = completedTrips.reduce((sum, t) => sum + (t.fuelConsumed || 0), 0);
    
    return {
      name: v.nameModel,
      reg: v.registrationNumber,
      efficiency: totalFuel > 0 ? Number((totalDistance / totalFuel).toFixed(2)) : 0
    };
  }).filter(v => v.efficiency > 0);

  // Calculate Operational Cost Breakdowns (Fuel, Maintenance, Tolls)
  const costBreakdownData = [
    {
      name: 'Fuel',
      value: fuelLogs.reduce((sum, f) => sum + f.cost, 0),
      color: '#8b5cf6' // Violet-500
    },
    {
      name: 'Maintenance',
      value: maintenanceLogs.reduce((sum, m) => sum + m.cost, 0),
      color: '#f59e0b' // Amber-500
    },
    {
      name: 'Tolls & Other',
      value: expenses.filter(e => e.type === 'Toll').reduce((sum, e) => sum + e.amount, 0),
      color: '#06b6d4' // Cyan-500
    }
  ];

  // Calculate ROI per vehicle
  // Formula: [Revenue - (Maintenance + Fuel)] / Acquisition Cost
  // We simulate trip revenue: $4.50 per kilometer of completed trips
  const vehicleROI = vehicles.map((v) => {
    const completedTrips = trips.filter((t) => t.vehicleId === v.id && t.status === 'Completed');
    
    // Revenue = actual distance * 4.5
    const revenue = completedTrips.reduce((sum, t) => sum + ((t.actualDistance || t.plannedDistance) * 4.5), 0);
    
    // Fuel Cost
    const fuelCost = fuelLogs.filter((f) => f.vehicleId === v.id).reduce((sum, f) => sum + f.cost, 0);
    
    // Maintenance Cost
    const maintenanceCost = maintenanceLogs.filter((m) => m.vehicleId === v.id).reduce((sum, m) => sum + m.cost, 0);
    
    const opCost = fuelCost + maintenanceCost;
    const netProfit = revenue - opCost;
    
    // ROI as percentage
    const roiPercentage = v.acquisitionCost > 0 
      ? Number(((netProfit / v.acquisitionCost) * 100).toFixed(2))
      : 0;

    return {
      name: v.nameModel,
      reg: v.registrationNumber,
      revenue,
      opCost,
      roi: roiPercentage
    };
  });

  // ----------------------------------------------------
  // EXPORTS
  // ----------------------------------------------------
  const handleCSVExport = () => {
    // Construct CSV Header
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Vehicle Model,Registration,Estimated Revenue,Operational Cost,ROI (%)\n';
    
    // Construct CSV Rows
    vehicleROI.forEach((v) => {
      csvContent += `"${v.name}","${v.reg}",${v.revenue},${v.opCost},${v.roi}\n`;
    });
    
    // Trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TransitOps_Fleet_ROI_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ----------------------------------------------------
  // AI FLEET INSIGHTS (Wow Feature)
  // ----------------------------------------------------
  const presetQueries = [
    'Which vehicles are costing the most this month?',
    'What is the highest ROI vehicle in our fleet?',
    'Are there any vehicles with poor fuel efficiency?'
  ];

  const handleAISearch = (queryStr) => {
    const query = queryStr || aiQuery;
    if (!query.trim()) return;

    setIsAiLoading(true);
    setAiQuery(query);
    setAiResponse(null);

    // Simulate natural language analytics response
    setTimeout(() => {
      const lower = query.toLowerCase();
      let response = '';

      if (lower.includes('cost') || lower.includes('expense')) {
        // Find most expensive vehicle
        const sortedByCost = [...vehicleROI].sort((a, b) => b.opCost - a.opCost);
        const top = sortedByCost[0];
        response = `Based on financial records, the vehicle costing the most is **${top.name} (${top.reg})** with a total operational cost of **$${top.opCost.toLocaleString()}** (including fuel and maintenance logs). We recommend conducting a preventive check to see if maintenance needs optimization.`;
      } else if (lower.includes('roi') || lower.includes('profit') || lower.includes('return')) {
        const sortedByROI = [...vehicleROI].sort((a, b) => b.roi - a.roi);
        const top = sortedByROI[0];
        response = `The fleet vehicle displaying the highest return on investment (ROI) is **${top.name} (${top.reg})** at **${top.roi}%**. It has generated an estimated **$${top.revenue.toLocaleString()}** in simulated logistics revenue against **$${top.opCost.toLocaleString()}** operational cost.`;
      } else if (lower.includes('fuel') || lower.includes('efficient')) {
        if (vehicleFuelEfficiency.length > 0) {
          const sortedByEff = [...vehicleFuelEfficiency].sort((a, b) => a.efficiency - b.efficiency);
          const poorest = sortedByEff[0];
          response = `Analysis indicates that **${poorest.name} (${poorest.reg})** has the lowest fuel efficiency at **${poorest.efficiency} km/L**. Drivers on this vehicle should be reviewed for eco-driving habits, or the vehicle tire pressure and engine tuning should be inspected.`;
        } else {
          response = `There are currently no completed trip fuel records to calculate efficiency. Log fuel consumptions on completed trips first.`;
        }
      } else {
        response = `I analyzed our fleet metrics: We have **${vehicles.length}** vehicles, **${trips.length}** trips logged, and total fleet maintenance costs stand at **$${costBreakdownData[1].value.toLocaleString()}**. Please ask about costs, ROI, or fuel efficiency to get precise insights.`;
      }

      setAiResponse(response);
      setIsAiLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-sans">Reports & Analytics</h2>
          <p className="text-sm text-slate-400">View real-time efficiency dashboards, financial returns, and export compliance data.</p>
        </div>
        <button
          onClick={handleCSVExport}
          className="flex items-center px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-205 border border-slate-750 font-bold text-xs rounded-xl shadow-lg transition-colors"
        >
          <Download className="h-4 w-4 mr-1.5" />
          Export Fleet ROI CSV
        </button>
      </div>

      {/* AI Fleet Insights Section (Wow Feature) */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 relative overflow-hidden">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-600 rounded-lg text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">AI Fleet Analyst Insights</h3>
        </div>
        <p className="text-xs text-slate-450">
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
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-600"
          />
          <button
            onClick={() => handleAISearch()}
            className="p-3 bg-violet-650 hover:bg-blue-600 rounded-xl text-white shadow-lg transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-2 pt-1">
          {presetQueries.map((pq, idx) => (
            <button
              key={idx}
              onClick={() => handleAISearch(pq)}
              className="text-[10px] bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800/80 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              {pq}
            </button>
          ))}
        </div>

        {/* AI Answer Box */}
        {(isAiLoading || aiResponse) && (
          <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl space-y-2 mt-4 animate-fade-in">
            {isAiLoading ? (
              <div className="flex items-center space-x-2 text-xs text-blue-400">
                <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></span>
                <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce delay-100"></span>
                <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce delay-200"></span>
                <span>Analyst is scanning fleet ledgers...</span>
              </div>
            ) : (
              <div className="text-xs text-slate-300 leading-relaxed">
                <p dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            )}
          </div>
        )}
      </div>

      <CostForecast />

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Operational Cost Breakdown Pie Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col h-[380px]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Operational Expense Breakdown</h3>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="95%">
              <PieChart>
                <Pie
                  data={costBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {costBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconSize={10}
                  formatter={(value, entry) => (
                    <span className="text-xs text-slate-400 font-medium">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle ROI Comparison Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col h-[380px]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Vehicle ROI Rate Comparison (%)</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="95%">
              <BarChart data={vehicleROI} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="reg" stroke="#64748b" style={{ fontSize: '10px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold', fontSize: '12px' }}
                  itemStyle={{ color: '#8b5cf6', fontSize: '12px' }}
                />
                <Bar dataKey="roi" name="ROI %" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                  {vehicleROI.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.roi >= 0 ? '#8b5cf6' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fuel Efficiency Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col h-[380px] lg:col-span-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Vehicle Fuel Efficiency (Distance / Fuel)</h3>
          <div className="flex-1 min-h-0">
            {vehicleFuelEfficiency.length > 0 ? (
              <ResponsiveContainer width="100%" height="95%">
                <BarChart data={vehicleFuelEfficiency} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="reg" stroke="#64748b" style={{ fontSize: '10px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '10px' }} label={{ value: 'km/L', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: '10px' } }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    labelStyle={{ color: '#f8fafc', fontWeight: 'bold', fontSize: '12px' }}
                    itemStyle={{ color: '#06b6d4', fontSize: '12px' }}
                  />
                  <Bar dataKey="efficiency" name="Efficiency (km/L)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Log completed trip fuel usage records to generate efficiency statistics.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}


