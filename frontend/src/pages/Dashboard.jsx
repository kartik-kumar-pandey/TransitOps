import { useState } from 'react';
import { useMockData } from '../context/MockDataContext';
import { useAuth } from '../context/AuthContext';
import TripTracker from '../components/TripTracker';
import CostForecast from '../components/CostForecast';
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
  Star,
  Activity,
  BarChart3,
  Clock,
  Zap,
  Shield,
  Navigation,
  CircleDot,
  Gauge,
} from 'lucide-react';

// ─── Section Header Component ────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle, badge, delay = 0 }) {
  return (
    <div
      className="flex items-center justify-between mb-5 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Icon className="h-4 w-4 text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white font-display tracking-tight">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {badge && (
        <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-full uppercase tracking-wider">
          {badge}
        </span>
      )}
    </div>
  );
}

// ─── KPI Card Component ───────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color, accent, progress, delay = 0 }) {
  return (
    <div
      className="p-5 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col justify-between gap-3 shadow-lg transition-all duration-300 hover:border-slate-700/60 hover:-translate-y-0.5 group cursor-default animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight">{label}</span>
        <div className={`p-2.5 rounded-xl border transition-all duration-300 group-hover:scale-110 ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-black text-white tracking-tight font-display">{value}</p>
        <p className="text-[11px] text-slate-500 mt-1 font-medium">{sub}</p>
      </div>
      {progress !== undefined && (
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all duration-700 ${accent}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Fleet Health Bar Component ───────────────────────────────────────────────
function FleetHealthBar({ available, onTrip, inShop, retired, total }) {
  const pctAvail   = total > 0 ? (available / total) * 100 : 0;
  const pctActive  = total > 0 ? (onTrip    / total) * 100 : 0;
  const pctShop    = total > 0 ? (inShop    / total) * 100 : 0;
  const pctRetired = total > 0 ? (retired   / total) * 100 : 0;

  const segments = [
    { pct: pctActive,  color: 'bg-blue-500',    label: 'On Trip',   count: onTrip },
    { pct: pctAvail,   color: 'bg-emerald-500', label: 'Available', count: available },
    { pct: pctShop,    color: 'bg-amber-500',   label: 'In Shop',   count: inShop },
    { pct: pctRetired, color: 'bg-slate-600',   label: 'Retired',   count: retired },
  ];

  return (
    <div className="space-y-3">
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5 bg-slate-900">
        {segments.map((s, i) =>
          s.count > 0 ? (
            <div
              key={i}
              className={`${s.color} h-full rounded-sm transition-all duration-700`}
              style={{ width: `${s.pct}%` }}
              title={`${s.label}: ${s.count}`}
            />
          ) : null
        )}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${s.color}`} />
            <span className="text-[10px] text-slate-500 font-medium">
              {s.label} <span className="text-slate-300 font-bold">{s.count}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Driver Row Component ─────────────────────────────────────────────────────
function DriverRow({ driver }) {
  const statusStyle =
    driver.status === 'Available'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : driver.status === 'On Trip'
      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      : driver.status === 'Suspended'
      ? 'bg-red-500/10 text-red-400 border-red-500/20'
      : 'bg-slate-800 text-slate-400 border-slate-700';

  const scoreColor =
    driver.safetyScore >= 85 ? 'text-emerald-400' :
    driver.safetyScore >= 60 ? 'text-amber-400' :
    'text-red-400';

  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-800/40 border border-transparent hover:border-slate-800/60 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
          {driver.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-200">{driver.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded font-mono">
              Class {driver.licenseCategory}
            </span>
            <span className={`text-[9px] font-bold flex items-center gap-0.5 ${scoreColor}`}>
              <Star className="h-2.5 w-2.5 fill-current" />
              {driver.safetyScore}
            </span>
          </div>
        </div>
      </div>
      <span className={`text-[9px] font-bold px-2 py-1 rounded-full border uppercase tracking-wider ${statusStyle}`}>
        {driver.status}
      </span>
    </div>
  );
}

// ─── Vehicle Row Component ────────────────────────────────────────────────────
function VehicleRow({ vehicle }) {
  const statusStyle =
    vehicle.status === 'Available'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : vehicle.status === 'On Trip'
      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      : vehicle.status === 'In Shop'
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      : 'bg-slate-800/60 text-slate-500 border-slate-700';

  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-800/40 border border-transparent hover:border-slate-800/60 transition-all">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
          <Truck className="h-3.5 w-3.5 text-slate-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-200">{vehicle.nameModel}</p>
          <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-500">
            <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">
              {vehicle.registrationNumber}
            </span>
            <span>·</span>
            <span>{vehicle.type}</span>
            <span>·</span>
            <span className="flex items-center gap-0.5">
              <MapPin className="h-2.5 w-2.5" />
              {vehicle.region}
            </span>
          </div>
        </div>
      </div>
      <span className={`text-[9px] font-bold px-2 py-1 rounded-full border uppercase tracking-wider ${statusStyle}`}>
        {vehicle.status}
      </span>
    </div>
  );
}

// ─── Alert Item ───────────────────────────────────────────────────────────────
function AlertItem({ icon: Icon, iconColor, bgColor, text, sub }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${bgColor}`}>
      <div className={`p-1.5 rounded-lg mt-0.5 ${bgColor}`}>
        <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-200">{text}</p>
        <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const { vehicles, drivers, trips, maintenanceLogs } = useMockData();
  const [regionFilter, setRegionFilter] = useState('All');
  const [typeFilter,   setTypeFilter]   = useState('All');

  // ── Computed values ──────────────────────────────────────────────────────
  const filteredVehicles = vehicles.filter((v) => {
    const matchRegion = regionFilter === 'All' || v.region === regionFilter;
    const matchType   = typeFilter   === 'All' || v.type   === typeFilter;
    return matchRegion && matchType;
  });

  const totalVehicles       = vehicles.length;
  const activeVehicles      = vehicles.filter((v) => v.status === 'On Trip').length;
  const availableVehicles   = vehicles.filter((v) => v.status === 'Available').length;
  const maintenanceVehicles = vehicles.filter((v) => v.status === 'In Shop').length;
  const retiredVehicles     = vehicles.filter((v) => v.status === 'Retired').length;

  const totalDrivers  = drivers.length;
  const activeDrivers = drivers.filter((d) => d.status === 'On Trip').length;
  const availDrivers  = drivers.filter((d) => d.status === 'Available').length;
  const suspDrivers   = drivers.filter((d) => d.status === 'Suspended').length;

  const activeTripsCount  = trips.filter((t) => t.status === 'Dispatched').length;
  const pendingTripsCount = trips.filter((t) => t.status === 'Draft').length;
  const completedTrips    = trips.filter((t) => t.status === 'Completed').length;

  const utilizationRate = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;
  const driverReadiness = totalDrivers  > 0 ? Math.round((availDrivers   / totalDrivers)  * 100) : 0;

  // Alerts derived from data
  const alerts = [
    ...drivers.filter(d => new Date(d.licenseExpiryDate) < new Date()).map(d => ({
      icon: Shield,
      iconColor: 'text-red-400',
      bgColor: 'bg-red-500/5 border-red-500/15',
      text: `${d.name}'s license has expired`,
      sub: `Expiry: ${d.licenseExpiryDate} · ${d.licenseNumber}`,
    })),
    ...drivers.filter(d => d.status === 'Suspended').map(d => ({
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-500/5 border-amber-500/15',
      text: `${d.name} is currently suspended`,
      sub: `Class ${d.licenseCategory} · Safety Score ${d.safetyScore}/100`,
    })),
    ...maintenanceLogs.filter(m => m.status === 'Active').map(m => ({
      icon: Wrench,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/5 border-blue-500/15',
      text: `${vehicles.find(v => v.id === m.vehicleId)?.registrationNumber || m.vehicleId} in maintenance`,
      sub: m.issueDescription,
    })),
  ];

  return (
    <div className="space-y-8 pb-14 animate-fade-in">

      {/* ── SECTION 1: Welcome Banner ──────────────────────────────────── */}
      <div
        className="relative overflow-hidden p-6 md:p-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 shadow-xl animate-slide-up"
        style={{ animationDelay: '0ms' }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/8 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-violet-600/5 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          {/* Left: Welcome text */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Platform Status: Operational
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-display">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-sm text-slate-500 mt-1.5 max-w-lg">
              Logged in as{' '}
              <strong className="text-blue-400 capitalize">{user?.role?.replace('_', ' ')}</strong>.
              Here&apos;s your fleet&apos;s real-time operational summary.
            </p>
          </div>

          {/* Right: Snapshot mini gauges */}
          <div className="flex gap-4 w-full xl:w-auto">
            <div className="flex-1 xl:w-44 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Fleet Utilization</span>
                <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-0.5 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                  <TrendingUp className="h-2.5 w-2.5" /> Optimal
                </span>
              </div>
              <p className="text-4xl font-black text-white font-display">
                {utilizationRate}<span className="text-xl text-slate-400">%</span>
              </p>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-700"
                  style={{ width: `${utilizationRate}%` }}
                />
              </div>
            </div>

            <div className="flex-1 xl:w-44 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Driver Readiness</span>
                <span className="text-[9px] font-bold text-cyan-400 flex items-center gap-0.5 bg-cyan-500/10 px-1.5 py-0.5 rounded-full border border-cyan-500/20">
                  <Gauge className="h-2.5 w-2.5" /> Ready
                </span>
              </div>
              <p className="text-4xl font-black text-white font-display">
                {driverReadiness}<span className="text-xl text-slate-400">%</span>
              </p>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-700"
                  style={{ width: `${driverReadiness}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Filters + KPI Groups ────────────────────────────── */}
      <div className="space-y-4">
        {/* Filters row */}
        <div
          className="flex flex-wrap items-center gap-3 animate-slide-up"
          style={{ animationDelay: '60ms' }}
        >
          <div className="flex items-center gap-2 text-slate-500">
            <Filter className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Filters</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-600 font-bold uppercase tracking-wider mb-0.5 ml-0.5">Region</span>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer transition-colors"
              >
                <option value="All">All Regions</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-600 font-bold uppercase tracking-wider mb-0.5 ml-0.5">Type</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer transition-colors"
              >
                <option value="All">All Types</option>
                <option value="Van">Vans</option>
                <option value="Truck">Trucks</option>
              </select>
            </div>
          </div>
          <span className="ml-auto text-[10px] text-slate-600 font-medium">
            {filteredVehicles.length} of {totalVehicles} vehicles shown
          </span>
        </div>

        {/* Grouped KPI cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Fleet group */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fleet</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <KpiCard label="On Trip"    value={activeVehicles}    sub={`of ${filteredVehicles.length} shown`} icon={Navigation}    color="text-blue-400 bg-blue-500/10 border-blue-500/20"           accent="bg-gradient-to-r from-blue-500 to-sky-400"      progress={filteredVehicles.length > 0 ? (activeVehicles / filteredVehicles.length) * 100 : 0}    delay={120} />
              <KpiCard label="Available"  value={availableVehicles} sub="ready to dispatch"                    icon={CheckCircle2}  color="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"  accent="bg-gradient-to-r from-emerald-500 to-teal-400"  progress={filteredVehicles.length > 0 ? (availableVehicles / filteredVehicles.length) * 100 : 0} delay={160} />
              <KpiCard label="In Shop"    value={maintenanceVehicles} sub="in maintenance"                     icon={Wrench}        color="text-amber-400 bg-amber-500/10 border-amber-500/20"        accent="bg-gradient-to-r from-amber-500 to-orange-400"  progress={filteredVehicles.length > 0 ? (maintenanceVehicles / filteredVehicles.length) * 100 : 0} delay={200} />
              <KpiCard label="Retired"    value={retiredVehicles}   sub="out of service"                       icon={CircleDot}     color="text-slate-400 bg-slate-800/60 border-slate-700"           accent="bg-slate-600"                                   progress={filteredVehicles.length > 0 ? (retiredVehicles / filteredVehicles.length) * 100 : 0}    delay={240} />
            </div>
          </div>

          {/* Drivers group */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 animate-slide-up" style={{ animationDelay: '160ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Drivers</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <KpiCard label="On Duty"   value={activeDrivers} sub="currently on trips"  icon={Zap}          color="text-cyan-400 bg-cyan-500/10 border-cyan-500/20"            accent="bg-gradient-to-r from-cyan-500 to-teal-400"     progress={totalDrivers > 0 ? (activeDrivers / totalDrivers) * 100 : 0}  delay={180} />
              <KpiCard label="Available" value={availDrivers}  sub="ready to assign"     icon={CheckCircle2} color="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"   accent="bg-gradient-to-r from-emerald-500 to-teal-400"  progress={totalDrivers > 0 ? (availDrivers / totalDrivers) * 100 : 0}   delay={220} />
              <KpiCard label="Suspended" value={suspDrivers}   sub="restricted from ops" icon={Shield}       color="text-red-400 bg-red-500/10 border-red-500/20"              accent="bg-gradient-to-r from-red-500 to-rose-400"      progress={totalDrivers > 0 ? (suspDrivers / totalDrivers) * 100 : 0}    delay={260} />
              <KpiCard label="Total"     value={totalDrivers}  sub="registered drivers"  icon={Users}        color="text-slate-400 bg-slate-800 border-slate-700"              accent="bg-slate-600"                                   delay={300} />
            </div>
          </div>

          {/* Trips group */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 animate-slide-up" style={{ animationDelay: '220ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <Route className="h-3.5 w-3.5 text-violet-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trips</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <KpiCard label="Dispatched" value={activeTripsCount}  sub="on road right now"  icon={Navigation}   color="text-sky-400 bg-sky-500/10 border-sky-500/20"             accent="bg-gradient-to-r from-sky-500 to-blue-400"      progress={trips.length > 0 ? (activeTripsCount / trips.length) * 100 : 0}  delay={240} />
              <KpiCard label="Pending"    value={pendingTripsCount} sub="saved drafts"        icon={Clock}        color="text-violet-400 bg-violet-500/10 border-violet-500/20"   accent="bg-gradient-to-r from-violet-500 to-purple-400" progress={trips.length > 0 ? (pendingTripsCount / trips.length) * 100 : 0} delay={280} />
              <KpiCard label="Completed"  value={completedTrips}    sub="this session"        icon={CheckCircle2} color="text-emerald-400 bg-emerald-500/10 border-emerald-500/20" accent="bg-gradient-to-r from-emerald-500 to-teal-400"  progress={trips.length > 0 ? (completedTrips / trips.length) * 100 : 0}   delay={320} />
              <KpiCard label="Total"      value={trips.length}      sub="all time"            icon={BarChart3}    color="text-slate-400 bg-slate-800 border-slate-700"            accent="bg-slate-600"                                   delay={360} />
            </div>
          </div>

        </div>
      </div>

      {/* ── SECTION 3: Fleet Health Bar ────────────────────────────────── */}
      <div
        className="p-5 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-lg animate-slide-up"
        style={{ animationDelay: '280ms' }}
      >
        <SectionHeader
          icon={Gauge}
          title="Fleet Health Overview"
          subtitle="Live breakdown of all vehicle statuses"
          badge={`${totalVehicles} vehicles`}
          delay={280}
        />
        <FleetHealthBar
          available={availableVehicles}
          onTrip={activeVehicles}
          inShop={maintenanceVehicles}
          retired={retiredVehicles}
          total={totalVehicles}
        />
      </div>

      {/* ── SECTION 4: Main 2/3 + 1/3 Grid ────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Left 2 cols ────────────────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-6">

          {/* Live Dispatch Tracking */}
          <div
            className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-xl animate-slide-up"
            style={{ animationDelay: '320ms' }}
          >
            <SectionHeader
              icon={Activity}
              title="Live Dispatch Tracking"
              subtitle="Real-time progress of all active trips"
              badge="live"
              delay={320}
            />
            <TripTracker />
          </div>

          {/* Active Fleet Registry */}
          <div
            className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-xl animate-slide-up"
            style={{ animationDelay: '380ms' }}
          >
            <SectionHeader
              icon={Truck}
              title="Active Fleet Registry"
              subtitle="Filtered vehicle roster with current status"
              badge={`${filteredVehicles.length} matching`}
              delay={380}
            />
            <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
              {filteredVehicles.map((v) => (
                <VehicleRow key={v.id} vehicle={v} />
              ))}
              {filteredVehicles.length === 0 && (
                <div className="text-center py-8 text-slate-600 text-xs">
                  No vehicles match the selected filters.
                </div>
              )}
            </div>
          </div>

          {/* AI Cost Forecaster */}
          <div
            className="animate-slide-up"
            style={{ animationDelay: '440ms' }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <BarChart3 className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-display tracking-tight">AI Cost Forecaster</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Simulate route operational costs before dispatch</p>
              </div>
            </div>
            <CostForecast />
          </div>

        </div>

        {/* ── Right 1 col ────────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Alerts & Flags — only shown when alerts exist */}
          {alerts.length > 0 && (
            <div
              className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-xl animate-slide-up"
              style={{ animationDelay: '340ms' }}
            >
              <SectionHeader
                icon={AlertTriangle}
                title="Alerts & Flags"
                subtitle="Items requiring immediate attention"
                badge={`${alerts.length} open`}
                delay={340}
              />
              <div className="space-y-2">
                {alerts.map((a, i) => (
                  <AlertItem key={i} {...a} />
                ))}
              </div>
            </div>
          )}

          {/* Duty Roster */}
          <div
            className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-xl animate-slide-up"
            style={{ animationDelay: '400ms' }}
          >
            <SectionHeader
              icon={Users}
              title="Duty Roster"
              subtitle="All registered drivers and current status"
              badge={`${drivers.length} total`}
              delay={400}
            />
            <div className="space-y-1 max-h-[340px] overflow-y-auto pr-1">
              {drivers.map((d) => (
                <DriverRow key={d.id} driver={d} />
              ))}
            </div>
          </div>

          {/* Session Stats */}
          <div
            className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-xl animate-slide-up space-y-4"
            style={{ animationDelay: '460ms' }}
          >
            <SectionHeader
              icon={BarChart3}
              title="Session Stats"
              subtitle="Key ratios for this session"
              delay={460}
            />
            <div className="space-y-4">
              {[
                { label: 'Fleet Utilization Rate', value: `${utilizationRate}%`,  bar: utilizationRate,  color: 'from-blue-500 to-sky-400' },
                { label: 'Driver Readiness',        value: `${driverReadiness}%`, bar: driverReadiness,  color: 'from-cyan-500 to-teal-400' },
                { label: 'Trip Completion Rate',     value: trips.length > 0 ? `${Math.round((completedTrips / trips.length) * 100)}%` : '0%', bar: trips.length > 0 ? Math.round((completedTrips / trips.length) * 100) : 0, color: 'from-emerald-500 to-teal-400' },
              ].map((stat, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-medium text-slate-500">{stat.label}</span>
                    <span className="text-xs font-bold text-white">{stat.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full bg-gradient-to-r ${stat.color} transition-all duration-700`}
                      style={{ width: `${stat.bar}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800/60 space-y-2">
              <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Tips</p>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Use the <span className="text-blue-400 font-semibold">Trips</span> panel to dispatch new routes with AI-ranked driver recommendations.
              </p>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Track costs and fuel efficiency under the <span className="text-blue-400 font-semibold">Reports</span> section.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
