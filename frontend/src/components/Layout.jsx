import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, Truck, Users, Route, Wrench,
  CircleDollarSign, BarChart3, LogOut, User as UserIcon,
  Sun, Moon, Bell
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { label: 'Dashboard',          path: '/dashboard',   icon: LayoutDashboard, roles: ['fleet_manager','driver','safety_officer','financial_analyst'] },
    { label: 'Vehicles',           path: '/vehicles',    icon: Truck,           roles: ['fleet_manager','driver','safety_officer','financial_analyst'] },
    { label: 'Drivers',            path: '/drivers',     icon: Users,           roles: ['fleet_manager','safety_officer'] },
    { label: 'Trips',              path: '/trips',       icon: Route,           roles: ['fleet_manager','driver'] },
    { label: 'Maintenance',        path: '/maintenance', icon: Wrench,          roles: ['fleet_manager'] },
    { label: 'Expenses & Fuel',    path: '/expenses',    icon: CircleDollarSign,roles: ['fleet_manager','financial_analyst','driver'] },
    { label: 'Reports & Analytics',path: '/reports',     icon: BarChart3,       roles: ['fleet_manager','financial_analyst'] },
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(user?.role));

  const roleColors = {
    fleet_manager:     'bg-violet-500/10 text-violet-400 border-violet-500/20',
    driver:            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    safety_officer:    'bg-rose-500/10 text-rose-400 border-rose-500/20',
    financial_analyst: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  const roleLabels = {
    fleet_manager: 'Fleet Manager', driver: 'Driver',
    safety_officer: 'Safety Officer', financial_analyst: 'Financial Analyst',
  };

  const currentTab = navItems.find(item => item.path === location.pathname)?.label || 'Overview';
  const isDark = theme === 'dark';

  return (
    <div
      className="flex min-h-screen font-sans"
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      {/* ── Sidebar ── */}
      <aside
        className="w-64 flex flex-col fixed inset-y-0 left-0 z-20 border-r glass-panel animate-slide-left"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        {/* Logo */}
        <div className="p-6 border-b flex items-center space-x-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="p-2 bg-violet-600 rounded-lg text-white shadow-lg shadow-violet-600/30 animate-pulse-glow">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              TransitOps
            </h1>
            <p className="text-[10px] opacity-40 font-medium uppercase tracking-widest -mt-1">
              Operations Hub
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  animationDelay: `${i * 40}ms`,
                  color: isActive ? undefined : 'var(--text-secondary)'
                }}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium animate-slide-left ${
                  isActive
                    ? 'bg-violet-600/20 text-violet-400 border-l-4 border-violet-500 pl-3'
                    : 'hover:bg-white/5'
                }`}
              >
                <Icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? 'text-violet-400' : ''}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div
            className="flex items-center space-x-3 p-2 rounded-xl border mb-2"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="p-2 rounded-lg" style={{ background: 'var(--border-subtle)' }}>
              <UserIcon className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
              <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase mt-1 ${roleColors[user?.role] || ''}`}>
                {roleLabels[user?.role] || user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl border text-xs font-medium transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="pl-64 flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header
          className="h-16 border-b flex items-center justify-between px-8 sticky top-0 z-10 backdrop-blur-md"
          style={{
            backgroundColor: isDark ? 'rgba(7,11,19,0.85)' : 'rgba(248,250,252,0.85)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {currentTab}
          </h2>

          <div className="flex items-center space-x-3">
            {/* Online indicator */}
            <span className="hidden md:flex items-center text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse" />
              Demo Server Online
            </span>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark
                ? <Sun className="h-4 w-4 text-amber-400" />
                : <Moon className="h-4 w-4 text-indigo-500" />
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
