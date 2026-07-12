import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Truck, ShieldAlert, Sun, Moon, UserPlus, LogIn } from 'lucide-react';

export default function Login() {
  const { login, register, mockUsers } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'
  
  // Fields for Sign In
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Fields for Sign Up
  const [name, setName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [role, setRole] = useState('fleet_manager');

  const [error, setError] = useState('');
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) navigate('/dashboard');
    else setError(res.error);
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim() || !signUpEmail.trim() || !signUpPassword.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    
    const res = await register(name, signUpEmail, signUpPassword, role);
    if (res.success) navigate('/dashboard');
    else setError(res.error);
  };

  const handleQuickLogin = async (userEmail) => {
    setError('');
    const res = await login(userEmail, 'transit123');
    if (res.success) navigate('/dashboard');
    else setError(res.error);
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-6 font-sans relative transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      {/* Background glow blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/8 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-sky-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Theme toggle top right */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
        style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-blue-500" />}
      </button>

      {/* Auth Container Card */}
      <div
        className="relative z-10 w-full max-w-md p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-scale-in"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-modal)',
        }}
      >
        {/* Logo */}
        <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-600/30 mb-4 animate-pulse-glow">
          <Truck className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-sky-400 bg-clip-text text-transparent mb-1 font-display">
          TransitOps
        </h1>
        <p className="text-sm mb-6 text-center" style={{ color: 'var(--text-muted)' }}>
          Smart Transport Operations Platform
        </p>

        {/* Form Tab Switches */}
        <div 
          className="flex w-full p-1 rounded-xl mb-6"
          style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border-color)' }}
        >
          <button
            onClick={() => { setActiveTab('signin'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'signin' 
                ? 'shadow-sm text-white' 
                : 'text-slate-500 hover:text-slate-350'
            }`}
            style={activeTab === 'signin' ? { background: 'var(--bg-base)', border: '1px solid var(--border-color)' } : {}}
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('signup'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'signup' 
                ? 'shadow-sm text-white' 
                : 'text-slate-500 hover:text-slate-350'
            }`}
            style={activeTab === 'signup' ? { background: 'var(--bg-base)', border: '1px solid var(--border-color)' } : {}}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Create Account
          </button>
        </div>

        {error && (
          <div className="w-full mb-4 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs flex items-center space-x-2 animate-shake">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Sign In Form */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="w-full space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-label)' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@transitops.com"
                required
                className="w-full rounded-xl px-4 py-3 text-sm transition-colors"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-label)' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs text-blue-500 hover:text-blue-400 font-semibold cursor-pointer border-none bg-none p-0 outline-none"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl px-4 py-3 text-sm transition-colors"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all duration-200 text-sm mt-2 cursor-pointer active:scale-95"
            >
              Sign In
            </button>
          </form>
        )}

        {/* Sign Up / Create Account Form */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="w-full space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-label)' }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                required
                className="w-full rounded-xl px-4 py-3 text-sm transition-colors"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-label)' }}>
                Email Address
              </label>
              <input
                type="email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                placeholder="e.g. newuser@transitops.com"
                required
                className="w-full rounded-xl px-4 py-3 text-sm transition-colors"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-label)' }}>
                Password
              </label>
              <input
                type="password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl px-4 py-3 text-sm transition-colors"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-label)' }}>
                Choose Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm transition-colors cursor-pointer select-base"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              >
                <option value="fleet_manager">Fleet Manager</option>
                <option value="driver">Driver</option>
                <option value="safety_officer">Safety Officer</option>
                <option value="financial_analyst">Financial Analyst</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all duration-200 text-sm mt-2 cursor-pointer active:scale-95"
            >
              Sign Up & Login
            </button>
          </form>
        )}

        {/* Quick Demo Logins */}
        <div className="w-full mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <p className="text-center text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-label)' }}>
            Quick Demo Logins
          </p>
          <div className="grid grid-cols-2 gap-2">
            {mockUsers.map((mu) => (
              <button
                key={mu.id}
                onClick={() => handleQuickLogin(mu.email)}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl text-center transition-all duration-200 cursor-pointer"
                style={{
                  background: 'var(--bg-card-alt)',
                  border: '1px solid var(--border-color)',
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
                <span className="text-xs font-bold truncate max-w-full" style={{ color: 'var(--text-primary)' }}>
                  {mu.name.split(' ')[0]}
                </span>
                <span className="text-[9px] uppercase font-semibold mt-0.5 tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {mu.role.replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
