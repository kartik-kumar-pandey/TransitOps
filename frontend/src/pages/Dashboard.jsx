import { useState } from 'react';
import { useMockData } from '../context/MockDataContext';
import { useAuth } from '../context/AuthContext';
import {
  Truck,
  Users,
  Route,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  TrendingUp
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
    { label: 'Active Vehicles', value: activeVehicles, sub: `out of ${totalVehicles}`, icon: Truck, color: 'text-violet-400 bg-violet-500/10' },
    { label: 'Available Vehicles', value: availableVehicles, sub: 'ready for dispatch', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10' },
    { label: 'In Maintenance', value: maintenanceVehicles, sub: 'currently in shop', icon: Wrench, color: 'text-amber-400 bg-amber-500/10' },
    { label: 'Drivers On Duty', value: activeDrivers, sub: `out of ${totalDrivers} total`, icon: Users, color: 'text-cyan-400 bg-cyan-500/10' },
    { label: 'Active Trips', value: activeTripsCount, sub: 'on road right now', icon: Route, color: 'text-indigo-400 bg-indigo-500/10' },
    { label: 'Pending Trips', value: pendingTripsCount, sub: 'saved drafts', icon: AlertTriangle, color: 'text-rose-400 bg-rose-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 glass-panel rounded-2xl border border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Welcome back, {user?.name}!</h2>
          <p className="text-sm text-slate-400">
            Here is your current fleet operations overview. You are logged in as{' '}
            <strong className="text-violet-400 capitalize">{user?.role.replace('_', ' ')}</strong>.
          </p>
        </div>

        {/* Global Filters */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Region</span>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-violet-500"
            >
              <option value="All">All Regions</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
            </select>
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Vehicle Type</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-violet-500"
            >
              <option value="All">All Types</option>
              <option value="Van">Vans</option>
              <option value="Truck">Trucks</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Fleet Utilization Large Widget */}
        <div className="col-span-1 md:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fleet Utilization Rate</span>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-5xl font-extrabold text-white tracking-tight">{utilizationRate}%</span>
              <span className="text-xs text-emerald-400 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <TrendingUp className="h-3 w-3 mr-1" />
                Optimal
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 max-w-sm">
              Current percentage of vehicles deployed on active trips compared to total vehicles registered under current filters.
            </p>
          </div>

          {/* Graphical Representation */}
          <div className="mt-6">
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-violet-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${utilizationRate}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-wider">
              <span>0% Utilized</span>
              <span>100% Full Capacity</span>
            </div>
          </div>
        </div>

        {/* Dynamic metrics */}
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</span>
                <p className="text-3xl font-extrabold text-white mt-1.5 tracking-tight">{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.sub}</p>
              </div>
              <div className={`p-3.5 rounded-xl ${s.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Overview Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vehicles Status Box */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-md font-bold text-slate-200 mb-4 flex items-center">
            <Truck className="h-5 w-5 mr-2 text-violet-400" />
            Active Fleet Summary
          </h3>
          <div className="divide-y divide-slate-800/60 max-h-[300px] overflow-y-auto">
            {filteredVehicles.map((v) => (
              <div key={v.id} className="flex justify-between items-center py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-200">{v.nameModel}</p>
                  <span className="text-xs text-slate-500">{v.registrationNumber} • {v.type}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                    v.status === 'Available'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : v.status === 'On Trip'
                      ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                      : v.status === 'In Shop'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-slate-800 text-slate-505 border-slate-700'
                  }`}
                >
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Driver Box */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-md font-bold text-slate-200 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-violet-400" />
            Duty Roster Summary
          </h3>
          <div className="divide-y divide-slate-800/60 max-h-[300px] overflow-y-auto">
            {drivers.map((d) => (
              <div key={d.id} className="flex justify-between items-center py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-200">{d.name}</p>
                  <span className="text-xs text-slate-500">Score: {d.safetyScore}/100 • {d.licenseCategory}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                    d.status === 'Available'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : d.status === 'On Trip'
                      ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
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
      </div>
    </div>
  );
}
