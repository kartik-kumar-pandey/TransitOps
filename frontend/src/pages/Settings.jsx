import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Server, RefreshCw, CheckCircle, AlertTriangle, Users } from 'lucide-react';

export default function Settings() {
  const { user, mockUsers } = useAuth();
  const [backendStatus, setBackendStatus] = useState('checking');
  const [dbStatus, setDbStatus] = useState('checking');
  const [lastChecked, setLastChecked] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const checkConnection = async () => {
    setIsLoading(true);
    setBackendStatus('checking');
    try {
      const res = await fetch('http://localhost:5000/health');
      if (res.ok) {
        setBackendStatus('online');
        setDbStatus('connected');
      } else {
        setBackendStatus('offline');
        setDbStatus('disconnected');
      }
    } catch (e) {
      setBackendStatus('offline');
      setDbStatus('disconnected');
    }
    setLastChecked(new Date().toLocaleTimeString());
    setIsLoading(false);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const roleLabels = {
    fleet_manager: 'Fleet Manager',
    dispatcher: 'Dispatcher',
    safety_officer: 'Safety Officer',
    financial_analyst: 'Financial Analyst',
  };

  const isFleetManager = user?.role === 'fleet_manager';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">System & Profile Settings</h2>
        <p className="text-sm text-[var(--text-secondary)]">Manage your workspace configuration and view backend service status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="glass-panel p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4">
          <div className="flex items-center space-x-3 pb-4 border-b border-[var(--border-subtle)]">
            <div className="p-3 bg-blue-600/10 text-blue-400 rounded-xl">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">My Profile</h3>
              <p className="text-xs text-[var(--text-secondary)]">Your active session details</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Name</label>
              <div className="font-semibold text-[var(--text-primary)]">{user?.name}</div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Email Address</label>
              <div className="font-semibold text-[var(--text-primary)] font-mono">{user?.email}</div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Roster Role</label>
              <span className="inline-block px-2.5 py-0.5 mt-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase text-[9px]">
                {roleLabels[user?.role] || user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Center Column: Backend Health */}
        <div className="glass-panel p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-violet-650/10 text-blue-400 rounded-xl">
                <Server className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Backend Connection</h3>
                <p className="text-xs text-[var(--text-secondary)]">Express server health indicators</p>
              </div>
            </div>
            <button
              onClick={checkConnection}
              disabled={isLoading}
              className="p-1.5 hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] transition-colors active:scale-95 disabled:opacity-50"
              title="Refresh connection status"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">REST Server API (Port 5000):</span>
              {backendStatus === 'online' ? (
                <span className="flex items-center text-emerald-400 font-bold">
                  <CheckCircle className="h-4.5 w-4.5 mr-1" />
                  Online
                </span>
              ) : backendStatus === 'offline' ? (
                <span className="flex items-center text-red-400 font-bold">
                  <AlertTriangle className="h-4.5 w-4.5 mr-1" />
                  Offline
                </span>
              ) : (
                <span className="text-[var(--text-muted)] italic">Checking...</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Neon Database Status:</span>
              {dbStatus === 'connected' ? (
                <span className="flex items-center text-emerald-400 font-bold">
                  <CheckCircle className="h-4.5 w-4.5 mr-1" />
                  Connected
                </span>
              ) : dbStatus === 'disconnected' ? (
                <span className="flex items-center text-red-400 font-bold">
                  <AlertTriangle className="h-4.5 w-4.5 mr-1" />
                  Disconnected
                </span>
              ) : (
                <span className="text-[var(--text-muted)] italic">Checking...</span>
              )}
            </div>

            {lastChecked && (
              <div className="pt-2 text-[10px] text-[var(--text-muted)] text-right">
                Last checked: {lastChecked}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: RBAC Roster List (Managers only) */}
        <div className="glass-panel p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4 lg:col-span-3">
          <div className="flex items-center space-x-3 pb-4 border-b border-[var(--border-subtle)]">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">User Roster & Access Controls</h3>
              <p className="text-xs text-[var(--text-secondary)]">Manage registered accounts and operational roles</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-2">Name</th>
                  <th className="py-3 px-2">Email Address</th>
                  <th className="py-3 px-2">Assigned Role</th>
                  <th className="py-3 px-2 text-right">Access Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] font-medium">
                {mockUsers.map((mu) => (
                  <tr key={mu.id} className="hover:bg-[var(--bg-card)]/40 transition-colors">
                    <td className="py-3 px-2 text-[var(--text-primary)] font-semibold">{mu.name}</td>
                    <td className="py-3 px-2 text-[var(--text-secondary)] font-mono">{mu.email}</td>
                    <td className="py-3 px-2">
                      <span className="inline-block px-2 py-0.5 rounded bg-blue-500/5 text-blue-400 border border-blue-500/10 text-[9px] uppercase font-bold">
                        {roleLabels[mu.role] || mu.role}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
