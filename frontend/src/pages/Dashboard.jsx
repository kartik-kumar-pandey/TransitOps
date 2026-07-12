import { useState, useEffect } from 'react';
import { useMockData } from '../context/MockDataContext';
import { useAuth } from '../context/AuthContext';
import TripTracker from '../components/TripTracker';
import CostForecast from '../components/CostForecast';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Truck,
  Users,
  Route,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Star,
  Activity,
  BarChart3,
  Clock,
  Zap,
  Shield,
  Navigation,
  DollarSign
} from 'lucide-react';

// ─── Section Header Component ────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle, badge }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-500 to-sky-400 text-white shadow-sm flex items-center justify-center">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="text-sm font-bold font-display tracking-tight" style={{ color: 'var(--text-heading)' }}>{title}</h3>
          {subtitle && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
        </div>
      </div>
      {badge && (
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-card-alt)', border: '1px solid var(--border-color)' }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

// ─── Sparkline Graph Component ───────────────────────────────────────────────
function Sparkline({ data, color = "#3b82f6" }) {
  const width = 100;
  const height = 30;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((val - min) / (max - min || 1)) * height * 0.7 - height * 0.15;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible opacity-80">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

// ─── Circular Progress Meter Component ─────────────────────────────────────────
function CircularProgress({ percentage, color = "#10b981", size = 44 }) {
  const radius = size * 0.4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--border-subtle)"
          strokeWidth="3.5"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-[10px] font-bold" style={{ color: 'var(--text-primary)' }}>
        {percentage}%
      </span>
    </div>
  );
}

// ─── Stackable Avatar Pile Component ──────────────────────────────────────────
function AvatarPile({ names }) {
  return (
    <div className="flex -space-x-2.5 overflow-hidden">
      {names.map((name, i) => (
        <div
          key={i}
          className="w-7.5 h-7.5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 shrink-0 select-none shadow-sm"
          style={{
            background: 'var(--border-strong)',
            color: 'var(--text-secondary)',
            borderColor: 'var(--bg-card)'
          }}
          title={name}
        >
          {name.split(' ').map(n => n[0]).join('')}
        </div>
      ))}
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
        <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{text}</p>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>
      </div>
    </div>
  );
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const { user } = useAuth();
  const { vehicles, drivers, trips, maintenanceLogs, expenses, fuelLogs } = useMockData();
  const [time, setTime] = useState(new Date());
  const [aiRiskSummary, setAiRiskSummary] = useState(null);
  const [aiForecast, setAiForecast] = useState(null);

  // Ticking Clock hook
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch AI forecast & risk data from backend
  useEffect(() => {
    const fetchAiData = async () => {
      try {
        const token = localStorage.getItem('transitops_token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        const [riskRes, forecastRes] = await Promise.all([
          fetch(`${API}/ai/license-risk`, { headers }),
          fetch(`${API}/ai/cost-forecast`, { method: 'POST', headers })
        ]);

        if (riskRes.ok) {
          const riskData = await riskRes.json();
          setAiRiskSummary(riskData);
        }
        if (forecastRes.ok) {
          const forecastData = await forecastRes.json();
          setAiForecast(forecastData);
        }
      } catch (e) {
        console.error('Failed to fetch AI dashboard data:', e);
      }
    };

    fetchAiData();
  }, []);

  // Compute operational statistics
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter((v) => v.status === 'On Trip').length;
  const availableVehicles = vehicles.filter((v) => v.status === 'Available').length;
  const maintenanceVehicles = vehicles.filter((v) => v.status === 'In Shop').length;

  const totalDrivers = drivers.length;
  const onDutyDrivers = drivers.filter((d) => d.status === 'On Trip').length;
  const availableDrivers = drivers.filter((d) => d.status === 'Available').length;
  const suspendedDrivers = drivers.filter((d) => d.status === 'Suspended').length;

  const activeTripsCount = trips.filter((t) => t.status === 'Dispatched').length;
  const pendingTripsCount = trips.filter((t) => t.status === 'Draft').length;
  const completedTrips = trips.filter((t) => t.status === 'Completed').length;

  const utilizationRate = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;
  const healthRate = totalVehicles > 0 ? Math.round(((totalVehicles - maintenanceVehicles) / totalVehicles) * 100) : 0;

  // Calculate session operating costs
  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
  const totalMaintCost = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
  const totalTollCost = expenses.filter(e => e.type === 'Toll').reduce((sum, e) => sum + e.amount, 0);
  const totalOpExpenses = Math.round((totalFuelCost + totalMaintCost + totalTollCost) * 83); // Convert to INR

  const formatRupees = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Sparkline data representing dispatch frequency over last 7 hours
  const dispatchesTrend = [1, 2, 1, 3, 2, 4, activeTripsCount || 1];

  // Stack of active/available driver names
  const activeDriverNames = drivers.filter(d => d.status !== 'Suspended').map(d => d.name).slice(0, 4);

  // Weekly operational dispatch activity trends
  const weeklyTrendData = [
    { day: 'Mon', trips: 8 },
    { day: 'Tue', trips: 14 },
    { day: 'Wed', trips: 11 },
    { day: 'Thu', trips: 18 },
    { day: 'Fri', trips: 22 },
    { day: 'Sat', trips: 15 },
    { day: 'Sun', trips: 12 }
  ];

  // Warnings / Alerts derived from data
  const alerts = [
    ...(aiRiskSummary && (aiRiskSummary.expiredCount > 0 || aiRiskSummary.criticalCount > 0 || aiRiskSummary.warningCount > 0) ? [{
      icon: Shield,
      iconColor: 'text-rose-500 font-bold',
      bgColor: 'bg-rose-500/10 border-rose-500/20',
      text: 'AI License Compliance Risk Flag',
      sub: aiRiskSummary.summary
    }] : []),
    ...drivers.filter(d => new Date(d.licenseExpiryDate) < new Date()).map(d => ({
      icon: Shield,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-500/10 border-red-500/20',
      text: `${d.name}'s license has expired`,
      sub: `Expiry: ${d.licenseExpiryDate} · ${d.licenseNumber}`,
    })),
    ...drivers.filter(d => d.status === 'Suspended').map(d => ({
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      text: `${d.name} is currently suspended`,
      sub: `Class ${d.licenseCategory} · Safety Score ${d.safetyScore}/100`,
    })),
    ...maintenanceLogs.filter(m => m.status === 'Active').map(m => ({
      icon: Wrench,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      text: `${vehicles.find(v => v.id === m.vehicleId)?.registrationNumber || m.vehicleId} in maintenance`,
      sub: m.issueDescription,
    })),
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">

      {/* ── SECTION 1: Dynamic Hero Welcome ──────────────────────── */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl shadow-md welcome-banner-premium animate-slide-up">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/8 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-label)' }}>
                System Online
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display" style={{ color: 'var(--text-heading)' }}>
              Welcome back, {user?.name}!
            </h2>
            <p className="text-xs mt-1.5 max-w-lg" style={{ color: 'var(--text-secondary)' }}>
              Operations Desk · Current role: <strong className="text-blue-500 capitalize">{user?.role?.replace('_', ' ')}</strong>.
            </p>
          </div>

          {/* Clock Widget */}
          <div
            className="flex items-center gap-3 py-2 px-4.5 rounded-2xl border font-mono text-right"
            style={{ background: 'var(--bg-card-alt)', borderColor: 'var(--border-color)' }}
          >
            <Clock className="h-4.5 w-4.5 text-blue-500 shrink-0" />
            <div>
              <p className="text-sm font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-[9px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Streamlined Metric Ribbon ─────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Card 1: Dispatched Trips */}
        <div
          className="p-5 rounded-2xl flex flex-col justify-between h-34 shadow-sm kpi-card-premium"
          style={{ borderTop: '4px solid #3b82f6' }}
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-label)' }}>Active Dispatches</span>
              <p className="text-3xl font-black font-display mt-1" style={{ color: 'var(--text-heading)' }}>{activeTripsCount}</p>
            </div>
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20">
              <Navigation className="h-4 w-4" />
            </div>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {pendingTripsCount} draft · {completedTrips} done
            </span>
            <Sparkline data={dispatchesTrend} color="#3b82f6" />
          </div>
        </div>

        {/* Card 2: Fleet Health Ratio */}
        <div
          className="p-5 rounded-2xl flex flex-col justify-between h-34 shadow-sm kpi-card-premium"
          style={{ borderTop: '4px solid #10b981' }}
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-label)' }}>Fleet Service Ratio</span>
              <p className="text-3xl font-black font-display mt-1" style={{ color: 'var(--text-heading)' }}>{availableVehicles}/{totalVehicles}</p>
            </div>
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {maintenanceVehicles} in maintenance shop
            </span>
            <CircularProgress percentage={healthRate} color="#10b981" />
          </div>
        </div>

        {/* Card 3: Drivers On Duty */}
        <div
          className="p-5 rounded-2xl flex flex-col justify-between h-34 shadow-sm kpi-card-premium"
          style={{ borderTop: '4px solid #06b6d4' }}
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-label)' }}>On-Duty Staff</span>
              <p className="text-3xl font-black font-display mt-1" style={{ color: 'var(--text-heading)' }}>{onDutyDrivers}/{totalDrivers}</p>
            </div>
            <div className="p-2 bg-cyan-500/10 text-cyan-500 rounded-xl border border-cyan-500/20">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {availableDrivers} ready to assign
            </span>
            <AvatarPile names={activeDriverNames} />
          </div>
        </div>

        {/* Card 4: Operating Expenses */}
        <div
          className="p-5 rounded-2xl flex flex-col justify-between h-34 shadow-sm kpi-card-premium"
          style={{ borderTop: '4px solid #f59e0b' }}
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-label)' }}>Operational Expenses</span>
              <p className="text-2xl font-black font-display mt-1" style={{ color: 'var(--text-heading)' }}>
                {formatRupees(totalOpExpenses)}
              </p>
            </div>
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Fuel + Repair provision
            </span>
            <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <TrendingUp className="h-2.5 w-2.5" /> {aiForecast ? `${aiForecast.projectedChange} Forecasted` : 'Normal'}
            </span>
          </div>
        </div>

      </div>

      {/* ── SECTION 3: Operations Core Grid ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (2/3 width) - Live Dispatch timeline tracking */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly dispatch line chart */}
          <div
            className="p-6 rounded-2xl shadow-sm animate-slide-up"
            style={{
              animationDelay: '250ms',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <SectionHeader
              icon={TrendingUp}
              title="Weekly Fleet Dispatches"
              subtitle="Total logged routes and deliveries over the last 7 days"
              badge="Trending"
            />
            <div className="h-48 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="day" stroke="var(--text-muted)" style={{ fontSize: '10px' }} />
                  <YAxis stroke="var(--text-muted)" style={{ fontSize: '10px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                      borderRadius: '12px',
                      boxShadow: 'var(--shadow-card)',
                      color: 'var(--text-primary)'
                    }}
                    labelStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="trips" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Real-Time Dispatch Tracking */}
          <div
            className="p-6 rounded-2xl shadow-sm animate-slide-up"
            style={{
              animationDelay: '300ms',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <SectionHeader
              icon={Activity}
              title="Real-Time Dispatch Tracking"
              subtitle="Live route milestones, fuel logs, and safety ratings"
              badge="Live"
            />
            <TripTracker />
          </div>
        </div>

        {/* Right Column (1/3 width) - Cost simulator & Alerts */}
        <div className="space-y-6">

          {/* AI Route Cost forecaster */}
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CostForecast />
          </div>

          {/* Active Warnings & Alerts */}
          {alerts.length > 0 && (
            <div
              className="p-6 rounded-2xl shadow-sm animate-slide-up space-y-4"
              style={{
                animationDelay: '150ms',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <SectionHeader
                icon={AlertTriangle}
                title="System alerts & flags"
                subtitle="Items requiring immediate desk actions"
                badge={`${alerts.length} Warnings`}
              />
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {alerts.map((a, idx) => (
                  <AlertItem key={idx} {...a} />
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
