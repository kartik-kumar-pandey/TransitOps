import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ClipboardCheck, MapPin, ShieldCheck, Coins } from 'lucide-react';

const ROLE_MAP = {
  fleet_manager: { name: 'Fleet Manager', icon: ClipboardCheck, color: '#1857E8' },
  driver: { name: 'Driver', icon: MapPin, color: '#0E9E7A' },
  safety_officer: { name: 'Safety Officer', icon: ShieldCheck, color: '#E8503A' },
  financial_analyst: { name: 'Financial Analyst', icon: Coins, color: '#E8940C' },
};

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
    <>
      <style>{`
        .login-backdrop {
          min-height: 100vh;
          background: linear-gradient(135deg, #0B0F17 0%, #151C2B 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 24px;
          font-family: var(--font-body);
        }
        .login-card {
          width: 100%;
          max-width: 440px;
          background: #FFFFFF;
          border-radius: 20px;
          padding: 40px 36px;
          box-shadow: 0 24px 48px rgba(0,0,0,0.25);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .login-logo-box {
          width: 48px;
          height: 48px;
          background: #E8940C;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .login-title {
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 800;
          color: #14181F;
          margin-bottom: 4px;
        }
        .login-subtitle {
          font-size: 14px;
          color: #6B7480;
          margin-bottom: 32px;
          text-align: center;
        }
        .login-input-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #6B7480;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .login-input {
          width: 100%;
          background: #FFFFFF;
          border: 1px solid #E1E5EB;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 14px;
          color: #14181F;
          transition: all 150ms ease-out;
        }
        .login-input::placeholder {
          color: #9AA2AF;
        }
        .login-input:focus {
          outline: none;
          border-color: #1857E8;
          box-shadow: 0 0 0 3px rgba(24,87,232,0.15);
        }
        .login-btn {
          width: 100%;
          background: #E8940C;
          color: #FFFFFF;
          font-weight: 700;
          font-size: 15px;
          padding: 14px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: transform 150ms ease-out, box-shadow 150ms ease-out;
          margin-top: 8px;
        }
        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(232,148,12,0.25);
        }
        .login-btn:active {
          transform: translateY(0);
        }
        .login-divider-container {
          position: relative;
          width: 100%;
          margin: 32px 0;
          text-align: center;
        }
        .login-divider-line {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          border-top: 1px solid #E1E5EB;
          z-index: 1;
        }
        .login-divider-text {
          position: relative;
          z-index: 2;
          background: #FFFFFF;
          padding: 0 16px;
          font-size: 11px;
          font-weight: 700;
          color: #6B7480;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .quick-logins-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          width: 100%;
        }
        .quick-login-tile {
          background: #FFFFFF;
          border: 1px solid #E1E5EB;
          border-radius: 10px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          cursor: pointer;
          transition: transform 150ms ease-out, background-color 150ms ease-out, border-color 150ms ease-out;
          text-align: left;
          width: 100%;
        }
        .quick-login-tile:hover {
          background: #F7F8FA;
          transform: translateY(-2px);
          border-color: var(--role-accent);
        }
        .quick-login-icon-wrap {
          position: relative;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          overflow: hidden;
        }
        .quick-login-icon-bg {
          position: absolute;
          inset: 0;
          opacity: 0.12;
        }
        .quick-login-name {
          font-size: 14px;
          font-weight: 700;
          color: #14181F;
          margin-bottom: 2px;
        }
        .quick-login-role {
          font-size: 11px;
          font-weight: 600;
          color: #6B7480;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}</style>
      <div className="login-backdrop">
        <div className="login-card">
          <div className="login-logo-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 20 12 12 20 12" />
              <circle cx="20" cy="12" r="2" fill="#FFFFFF" />
            </svg>
          </div>
          <h1 className="login-title">TransitOps</h1>
          <p className="login-subtitle">Smart Transport Operations Platform</p>

          {error && (
            <div style={{ width: '100%', marginBottom: 24, padding: 14, background: 'rgba(232,80,58,0.1)', border: '1px solid rgba(232,80,58,0.2)', borderRadius: 8, color: '#E8503A', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label className="login-input-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@transitops.com"
                required
                className="login-input"
              />
            </div>

            <div>
              <label className="login-input-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="login-input"
              />
            </div>

            <button type="submit" className="login-btn">
              Sign In
            </button>
          </form>

          <div className="login-divider-container">
            <div className="login-divider-line"></div>
            <span className="login-divider-text">Quick Demo Logins</span>
          </div>

          <div className="quick-logins-grid">
            {mockUsers.map((mu) => {
              const roleConfig = ROLE_MAP[mu.role] || ROLE_MAP.fleet_manager;
              const Icon = roleConfig.icon;
              return (
                <button
                  key={mu.id}
                  type="button"
                  onClick={() => handleQuickLogin(mu.email)}
                  className="quick-login-tile"
                  style={{ '--role-accent': roleConfig.color }}
                >
                  <div className="quick-login-icon-wrap">
                    <div className="quick-login-icon-bg" style={{ background: roleConfig.color }}></div>
                    <Icon size={16} color={roleConfig.color} style={{ position: 'relative', zIndex: 2 }} />
                  </div>
                  <span className="quick-login-name">{mu.name.split(' ')[0]}</span>
                  <span className="quick-login-role">{roleConfig.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
