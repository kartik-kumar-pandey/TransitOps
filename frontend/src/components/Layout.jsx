import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, Truck, Users, Route, Wrench,
  CircleDollarSign, BarChart3, LogOut, User as UserIcon,
  Sun, Moon
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { label: 'Dashboard',           path: '/dashboard',   icon: LayoutDashboard, roles: ['fleet_manager','driver','safety_officer','financial_analyst'] },
    { label: 'Vehicles',            path: '/vehicles',    icon: Truck,            roles: ['fleet_manager','driver','safety_officer','financial_analyst'] },
    { label: 'Drivers',             path: '/drivers',     icon: Users,            roles: ['fleet_manager','safety_officer'] },
    { label: 'Trips',               path: '/trips',       icon: Route,            roles: ['fleet_manager','driver'] },
    { label: 'Maintenance',         path: '/maintenance', icon: Wrench,           roles: ['fleet_manager'] },
    { label: 'Expenses & Fuel',     path: '/expenses',    icon: CircleDollarSign, roles: ['fleet_manager','financial_analyst','driver'] },
    { label: 'Reports & Analytics', path: '/reports',     icon: BarChart3,        roles: ['fleet_manager','financial_analyst'] },
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(user?.role));

  const roleColors = {
    fleet_manager:     'bg-blue-500/10 text-blue-500 border-blue-500/30',
    driver:            'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    safety_officer:    'bg-rose-500/10 text-rose-500 border-rose-500/30',
    financial_analyst: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  };
  const roleLabels = {
    fleet_manager: 'Fleet Manager', driver: 'Driver',
    safety_officer: 'Safety Officer', financial_analyst: 'Financial Analyst',
  };

  const currentTab = navItems.find(item => item.path === location.pathname)?.label || 'Overview';
  const isDark = theme === 'dark';

  return (
    <div className="flex min-h-screen font-sans" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className="w-64 flex flex-col fixed inset-y-0 left-0 z-20 glass-panel animate-slide-left"
        style={{ borderRight: '1px solid var(--border-color)' }}
      >
        {/* Logo */}
        <div className="p-6 flex items-center space-x-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-600/30 animate-pulse-glow shrink-0">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-500 to-sky-400 bg-clip-text text-transparent">
              TransitOps
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-widest -mt-0.5" style={{ color: 'var(--text-label)' }}>
              Operations Hub
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {visibleNavItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{ animationDelay: `${i * 40}ms` }}
                className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium animate-slide-left group
                  ${isActive
                    ? 'bg-blue-600/15 border-l-4 border-blue-500 pl-2.5'
                    : 'border-l-4 border-transparent'
                  }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 mr-3 shrink-0 transition-colors ${isActive ? 'text-blue-500' : ''}`}
                  style={{ color: isActive ? undefined : 'var(--text-muted)', width: '18px', height: '18px' }}
                />
                <span style={{ color: isActive ? (isDark ? '#60a5fa' : '#1d4ed8') : 'var(--text-secondary)' }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          {/* User card */}
          <div
            className="flex items-center space-x-3 p-3 rounded-xl mb-3"
            style={{
              background: 'var(--bg-card-alt)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: 'var(--border-strong)', color: 'var(--text-secondary)' }}
            >
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {user?.name}
              </p>
              <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase mt-0.5 ${roleColors[user?.role] || ''}`}>
                {roleLabels[user?.role] || user?.role}
              </span>
            </div>
          </div>

          {/* Theme toggle row */}
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-200 hover:scale-[1.02]"
              style={{
                borderColor: 'var(--border-color)',
                background: isDark ? 'var(--bg-card-alt)' : '#fefce8',
                color: isDark ? '#fbbf24' : '#92400e',
              }}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark
                ? <><Sun className="h-3.5 w-3.5" /> Light Mode</>
                : <><Moon className="h-3.5 w-3.5" /> Dark Mode</>
              }
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl border text-xs font-medium transition-all duration-200 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
          >
            <LogOut className="h-3.5 w-3.5 mr-2" />
            Log Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="pl-64 flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header
          className="h-16 flex items-center justify-between px-8 sticky top-0 z-10 backdrop-blur-md"
          style={{
            backgroundColor: isDark ? 'rgba(8,9,13,0.88)' : 'rgba(255,255,255,0.9)',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-heading)' }}>
              {currentTab}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            {/* Online indicator */}
            <span className="hidden md:flex items-center text-xs text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />
              Demo Online
            </span>

            {/* Theme toggle (header) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                borderColor: 'var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-secondary)',
              }}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark
                ? <Sun className="h-4 w-4 text-amber-400" />
                : <Moon className="h-4 w-4 text-blue-500" />
              }
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
