import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, ShieldAlert, ArrowLeft, Key } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: Reset Code & Password
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [receivedCode, setReceivedCode] = useState(''); // Shown in UI for demo convenience
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (res.ok) {
        setReceivedCode(data.resetToken || '');
        setStep(2);
      } else {
        setError(data.error || 'Failed to request reset code.');
      }
    } catch (err) {
      setError('Cannot connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetToken, newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Password has been reset successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.error || 'Failed to reset password.');
      }
    } catch (err) {
      setError('Cannot connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col justify-center items-center p-6 text-[var(--text-primary)] font-sans">
      <div className="w-full max-w-md bg-[var(--bg-surface)] p-8 rounded-2xl shadow-2xl border border-[var(--border-subtle)] flex flex-col items-center animate-scale-in">
        {/* Logo */}
        <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-600/30 mb-4 animate-pulse-glow">
          <Truck className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent mb-1 font-display">
          TransitOps
        </h1>
        <h2 className="text-md font-bold text-[var(--text-primary)] mt-2 mb-1">
          {step === 1 ? 'Forgot Password?' : 'Reset Your Password'}
        </h2>
        <p className="text-[var(--text-secondary)] text-xs mb-6 text-center max-w-xs">
          {step === 1
            ? "Enter your email address and we'll generate a reset code."
            : "Enter the code received and choose a new secure password."}
        </p>

        {error && (
          <div className="w-full mb-4 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="w-full mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs text-center font-semibold">
            {successMsg} Redirecting to login...
          </div>
        )}

        {/* Demo Code Visualizer Alert */}
        {step === 2 && receivedCode && receivedCode !== 'SIMULATED-SUCCESS' && (
          <div className="w-full mb-4 p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-xs flex flex-col space-y-1">
            <span className="font-bold uppercase tracking-wider text-[10px]">Demo Code Visualizer</span>
            <span>Use code: <strong className="text-blue-300 font-mono text-sm">{receivedCode}</strong> to complete reset.</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestCode} className="w-full space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. fleet@transit.com"
                required
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all duration-200 text-sm mt-2 cursor-pointer active:scale-95"
            >
              {loading ? 'Requesting...' : 'Request Reset Code'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl py-3 text-sm font-semibold transition-all duration-200 text-[var(--text-primary)] cursor-pointer flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="w-full space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Reset Code
              </label>
              <input
                type="text"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="6-digit code"
                required
                maxLength={6}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors font-mono tracking-widest text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all duration-200 text-sm mt-2 cursor-pointer active:scale-95"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl py-3 text-sm font-semibold transition-all duration-200 text-[var(--text-primary)] cursor-pointer flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
