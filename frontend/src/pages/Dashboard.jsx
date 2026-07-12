import { useState } from 'react';
import { useMockData } from '../context/MockDataContext';
import { useAuth } from '../context/AuthContext';
import TripTracker from '../components/TripTracker';
import {
  Truck,
  Users,
  Route,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Filter,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  Star,
  Activity,
  ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { vehicles, drivers, trips } = useMockData();
  const [regionFilter, setRegionFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Filter calculations based on region and type
  const filteredVehicles = vehicles.filter((v) => {
    const matchRegion = regionFilter === 'All' || v.region === regionFilter;
    const matchType = typeFilter === 'All' || v.type === typeFilter;
    return matchRegion && matchType;
  });

  const totalVehicles = filteredVehicles.length;
  const activeVehicles = filteredVehicles.filter((v) => v.status === 'On Trip').length;
  const availableVehicles = filteredVehicles.filter((v) => v.status === 'Available').length;
  const maintenanceVehicles = filteredVehicles.filter((v) => v.status === 'In Shop').length;

  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter((d) => d.status === 'On Trip').length;

  const activeTripsCount = trips.filter((t) => t.status === 'Dispatched').length;
  const pendingTripsCount = trips.filter((t) => t.status === 'Draft').length;

  const utilizationRate = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

  const stats = [
    { label: 'Active Vehicles', value: activeVehicles, sub: `out of ${totalVehicles}`, icon: Truck, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { label: 'Available Vehicles', value: availableVehicles, sub: 'ready for dispatch', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { label: 'In Maintenance', value: maintenanceVehicles, sub: 'currently in shop', icon: Wrench, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { label: 'Drivers On Duty', value: activeDrivers, sub: `out of ${totalDrivers} total`, icon: Users, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Active Trips', value: activeTripsCount, sub: 'on road right now', icon: Route, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
    { label: 'Pending Trips', value: pendingTripsCount, sub: 'saved drafts', icon: AlertTriangle, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 shadow-xl transition-all duration-300 hover:border-slate-700/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none animate-pulse-glow" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-sky-600/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Platform Status: Active</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-display">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-sm text-slate-450 mt-1 max-w-xl">
              You are logged in as <strong className="text-blue-400 capitalize">{user?.role.replace('_', ' ')}</strong>. Here is the operational state of your fleet.
            </p>
          </div>

          {/* Global Filters Panel */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-4 rounded-2xl w-full lg:w-auto">
            <div className="flex items-center gap-2 text-slate-450 mr-2">
              <Filter className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Filters</span>
            </div>
            
            <div className="flex flex-col min-w-[130px] flex-1 sm:flex-initial">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Region</span>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer transition-colors"
              >
                <option value="All">All Regions</option>
                <option value="North">North Region</option>
                <option value="South">South Region</option>
                <option value="East">East Region</option>
                <option value="West">West Region</option>
              </select>
            </div>

            <div className="flex flex-col min-w-[130px] flex-1 sm:flex-initial">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Vehicle Type</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer transition-colors"
              >
                <option value="All">All Types</option>
                <option value="Van">Vans</option>
                <option value="Truck">Trucks</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Fleet Utilization Large Widget */}
        <div className="col-span-1 md:col-span-2 p-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col justify-between relative overflow-hidden shadow-xl transition-all duration-300 hover:border-slate-700/60 group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fleet Utilization Rate</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <TrendingUp className="h-3 w-3 animate-pulse" />
                Optimal
              </span>
            </div>
            <div className="flex items-baseline space-x-2 mt-4">
              <span className="text-6xl font-black text-white tracking-tight font-display">{utilizationRate}%</span>
              <span className="text-xs text-slate-500 font-medium">active capacity</span>
            </div>
            <p className="text-xs text-slate-400 mt-3 max-w-sm leading-relaxed">
              Percentage of registered vehicles currently on active trips. Current active count is <strong>{activeVehicles}</strong> out of <strong>{totalVehicles}</strong> total.
            </p>
          </div>

          {/* Graphical Representation */}
          <div className="mt-8 relative z-10">
            <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800/80 p-0.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-sky-500 h-2 rounded-full transition-all duration-500 relative"
                style={{ width: `${utilizationRate}%` }}
              >
                <span className="absolute right-0 top-0 w-2 h-2 bg-white rounded-full animate-ping" />
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2.5 font-bold uppercase tracking-wider">
              <span>0% Deployed</span>
              <span>100% Deployed</span>
            </div>
          </div>
        </div>

        {/* Dynamic metrics */}
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div 
              key={idx} 
              className="p-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-between shadow-xl transition-all duration-300 hover:border-slate-700/60 hover:-translate-y-1 group cursor-default"
            >
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">{s.label}</span>
                <p className="text-4xl font-extrabold text-white tracking-tight font-display">{s.value}</p>
                <p className="text-xs text-slate-500 font-medium">{s.sub}</p>
              </div>
              <div className={`p-4 rounded-2xl border transition-all duration-300 group-hover:scale-105 ${s.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Trip Tracker & Registry */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Live Trip progress and Active Fleet */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Live Trip Tracker integrated directly on Dashboard */}
          <div className="p-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/60">
              <h3 className="text-md font-bold text-white flex items-center gap-2 font-display">
                <Activity className="h-5 w-5 text-blue-400" />
                Live Dispatch Tracking
              </h3>
              <span className="text-xs text-slate-500 font-medium">real-time updates</span>
            </div>
            
            <TripTracker />
          </div>

          {/* Vehicles Status Box */}
          <div className="p-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/60">
              <h3 className="text-md font-bold text-white flex items-center gap-2 font-display">
                <Truck className="h-5 w-5 text-blue-400" />
                Active Fleet Registry
              </h3>
              <span className="text-xs text-slate-500 font-medium">{filteredVehicles.length} vehicles matching</span>
            </div>

            <div className="divide-y divide-slate-800/40 max-h-[320px] overflow-y-auto pr-1 space-y-1">
              {filteredVehicles.map((v) => (
                <div 
                  key={v.id} 
                  className="flex justify-between items-center py-3 px-3 rounded-xl transition-colors hover:bg-slate-800/40 border border-transparent hover:border-slate-800/60"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{v.nameModel}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="font-mono bg-slate-950 px-1.5 py-0.5 rounded text-[10px] text-slate-400 border border-slate-900">{v.registrationNumber}</span>
                      <span>•</span>
                      <span>{v.type}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {v.region}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${
                      v.status === 'Available'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : v.status === 'On Trip'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : v.status === 'In Shop'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    {v.status}
                  </span>
                </div>
              ))}
              {filteredVehicles.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No vehicles match the selected filters.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Duty Roster & Quick Actions */}
        <div className="space-y-8">
          
          {/* Active Driver Box */}
          <div className="p-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/60">
              <h3 className="text-md font-bold text-white flex items-center gap-2 font-display">
                <Users className="h-5 w-5 text-blue-400" />
                Duty Roster
              </h3>
              <span className="text-xs text-slate-500 font-medium">{drivers.length} drivers</span>
            </div>

            <div className="divide-y divide-slate-800/40 max-h-[360px] overflow-y-auto pr-1 space-y-1">
              {drivers.map((d) => (
                <div 
                  key={d.id} 
                  className="flex justify-between items-center py-3 px-3 rounded-xl transition-colors hover:bg-slate-800/40 border border-transparent hover:border-slate-800/60"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{d.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="bg-slate-950 px-1.5 py-0.5 rounded text-[10px] text-slate-400 border border-slate-900">Class {d.licenseCategory}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span>{d.safetyScore}/100</span>
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${
                      d.status === 'Available'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : d.status === 'On Trip'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : d.status === 'Suspended'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info & Shortcut Widgets */}
          <div className="p-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Platform Guidelines</h4>
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-850 space-y-2">
              <p className="text-xs font-semibold text-slate-350">Quick Tip:</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Use the **AI Dispatch Advisor** in the Trips panel to automatically calculate candidate match rankings for new dispatches.
              </p>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-850 space-y-2">
              <p className="text-xs font-semibold text-slate-350">Reports & Analytics:</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Analyze operational costs, maintenance overhead, and fuel efficiency trends under the Reports panel.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}


