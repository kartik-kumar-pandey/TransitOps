import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, ShieldAlert } from 'lucide-react';

export default function Login() {
  const { login, mockUsers } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const res = login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error);
    }
  };

  const handleQuickLogin = (userEmail) => {
    setError('');
    const res = login(userEmail, 'password');
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] flex flex-col justify-center items-center p-6 text-slate-100 font-sans">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl border border-slate-800 flex flex-col items-center">
        {/* Logo */}
        <div className="p-3 bg-violet-600 rounded-2xl text-white shadow-xl shadow-violet-600/30 mb-4">
          <Truck className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-1">
          TransitOps
        </h1>
        <p className="text-slate-400 text-sm mb-6 text-center">
          Smart Transport Operations Platform
        </p>

        {error && (
          <div className="w-full mb-4 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@transitops.com"
              required
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 transition-all duration-200 text-sm mt-2"
          >
            Sign In
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div className="w-full border-t border-slate-800 mt-6 pt-6">
          <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            Quick Demo Logins
          </p>
          <div className="grid grid-cols-2 gap-2">
            {mockUsers.map((mu) => (
              <button
                key={mu.id}
                onClick={() => handleQuickLogin(mu.email)}
                className="flex flex-col items-center justify-center p-2.5 bg-slate-900/40 border border-slate-800/80 rounded-xl text-center hover:bg-slate-800/50 hover:border-slate-700 transition-all duration-200"
              >
                <span className="text-xs font-bold text-slate-200 truncate max-w-full">
                  {mu.name.split(' ')[0]}
                </span>
                <span className="text-[9px] text-slate-500 uppercase font-semibold mt-0.5 tracking-wider">
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
