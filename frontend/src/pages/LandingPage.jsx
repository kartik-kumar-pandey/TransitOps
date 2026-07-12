import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  Truck, Users, Navigation, BarChart3, Wrench, Sparkles,
  Search, ArrowRight, Sun, Moon, Menu, X, Star, CheckCircle2,
  TrendingUp, Shield, Mail, Phone, Globe, ExternalLink
} from 'lucide-react';

/* ─── CSS Styles ───────────────────────────────────────────── */
const CSS = `
  :root {
    --bg:          #08090d;
    --bg-subtle:   #0f111a;
    --bg-card:     #131622;
    --border:      #1f2436;
    --border-hover:#3b82f6;
    --text:        #f3f4f6;
    --text-muted:  #9ca3af;
    --text-muted2: #6b7280;
    --accent:      #3b82f6;
    --accent-hover:#2563eb;
    --accent-bg:   rgba(59,130,246,0.08);
    --shadow:      0 20px 50px rgba(0,0,0,0.5);
  }
  :root.light {
    --bg:          #f9fafb;
    --bg-subtle:   #f3f4f6;
    --bg-card:     #ffffff;
    --border:      #e5e7eb;
    --border-hover:#2563eb;
    --text:        #111827;
    --text-muted:  #4b5563;
    --text-muted2: #9ca3af;
    --accent:      #2563eb;
    --accent-hover:#1d4ed8;
    --accent-bg:   rgba(37,99,235,0.05);
    --shadow:      0 20px 40px rgba(0,0,0,0.06);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); transition: background 0.3s, color 0.3s; }
  .font-display { font-family: 'Bricolage Grotesque', sans-serif !important; }

  /* ── reusable hover card ── */
  .feat-card {
    transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease, border-color 0.25s ease;
    border: 1px solid var(--border);
    background: var(--bg-card);
  }
  .feat-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow);
    border-color: var(--border-hover);
  }

  /* ── animated workflow step card ── */
  .step-card {
    transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.35s ease, border-color 0.35s ease;
    border: 1px solid var(--border);
    background: var(--bg-card);
    position: relative;
    overflow: hidden;
  }
  .step-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 3px;
    background: var(--accent);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .step-card:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: var(--shadow);
    border-color: var(--border-hover);
  }
  .step-card:hover::before {
    transform: scaleX(1);
  }
  .step-number {
    transition: transform 0.3s ease, color 0.3s ease;
  }
  .step-card:hover .step-number {
    transform: translateY(-2px) scale(1.05);
    color: var(--accent);
  }
  .step-icon-wrap {
    transition: transform 0.3s ease, background-color 0.3s ease;
  }
  .step-card:hover .step-icon-wrap {
    transform: rotate(5deg) scale(1.05);
    background-color: var(--accent-bg);
  }

  /* ── button base ── */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 600;
    cursor: pointer; text-decoration: none; border: none; outline: none;
    transition: transform 0.15s ease, opacity 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
  }
  .btn:active { transform: scale(0.97); }

  .btn-primary {
    background: var(--text); color: var(--bg);
  }
  .btn-primary:hover { opacity: 0.9; }

  .btn-accent {
    background: var(--accent); color: #ffffff;
  }
  .btn-accent:hover { background: var(--accent-hover); }

  .btn-outline {
    background: transparent; color: var(--text);
    border: 1px solid var(--border);
  }
  .btn-outline:hover {
    background: var(--bg-subtle);
    border-color: var(--border-hover);
  }

  /* ── responsive adjustments ── */
  @media (max-width: 960px) {
    .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; text-align: center; }
    .hero-text-container { display: flex; flex-direction: column; align-items: center; }
    .hero-ctas { justify-content: center; }
    .steps-grid { grid-template-columns: 1fr !important; }
    .roles-grid { grid-template-columns: 1fr 1fr !important; }
    .testimonials-grid { grid-template-columns: 1fr !important; }
    .footer-grid { grid-template-columns: 1fr 1fr !important; }
  }
  @media (max-width: 600px) {
    .roles-grid { grid-template-columns: 1fr !important; }
    .footer-grid { grid-template-columns: 1fr !important; }
  }
`;

const STEPS = [
  { step: '01', icon: Truck, title: 'Register your fleet',  desc: 'Populate vehicle registry and driver profiles. Import using CSV uploads or add records manually.' },
  { step: '02', icon: Sparkles, title: 'Intelligent dispatch',  desc: 'Dispatch routes with AI-assisted safety ratings, license category verifications, and capacity fit checks.' },
  { step: '03', icon: Navigation, title: 'Track in real-time',    desc: 'Animate dispatches and simulate progress. Fuel logging, expenses, and analytics compile automatically.' },
];

const ROLES = [
  { name: 'Fleet Manager',     access: 'Full Operations Control', color: 'border-blue-500/20 text-blue-400 bg-blue-500/5' },
  { name: 'Driver',            access: 'Log Expenses & View Trips', color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' },
  { name: 'Safety Officer',    access: 'Credential Alerts & Scores', color: 'border-rose-500/20 text-rose-400 bg-rose-500/5' },
  { name: 'Financial Analyst', access: 'Cost Forecasts & ROI Reports', color: 'border-amber-500/20 text-amber-400 bg-amber-500/5' },
];

const TESTIMONIALS = [
  { name: 'Sarah K.',  role: 'Fleet Manager, LogiCorp',    text: 'Dispatch timelines cut down significantly. The AI suggestions keep our load capacity optimized.' },
  { name: 'Ravi M.',   role: 'Safety Officer, FreightLine', text: 'Credential alerts help us maintain compliance checks effortlessly. Essential fleet operational tool.' },
  { name: 'Dana W.',   role: 'Financial Analyst, TruckCo', text: 'The expense audits, fuel tracking, and cost projections save hours of spreadsheet compilation every week.' },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{CSS}</style>
      <div style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        
        {/* Navigation Bar */}
        <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck style={{ width: 16, height: 16, color: '#fff', margin: 'auto' }} />
              </div>
              <span className="font-display" style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)', letterSpacing: '-0.02em' }}>TransitOps</span>
            </Link>

            <nav style={{ display: 'flex', gap: 6 }} className="hidden md:flex">
              {['How It Works', 'Roles'].map(l => (
                <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
                  style={{ padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--text)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                >{l}</a>
              ))}
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={toggleTheme}
                style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
              >
                {theme === 'dark' ? <Sun style={{ width: 16, height: 16 }} /> : <Moon style={{ width: 16, height: 16 }} />}
              </button>
              
              <Link to="/login" className="btn btn-outline" style={{ padding: '8px 16px', borderRadius: 10, fontSize: 14 }}>Sign In</Link>
              <Link to="/login" className="btn btn-accent" style={{ padding: '8px 18px', borderRadius: 10, fontSize: 14 }}>Launch App</Link>
              
              <button onClick={() => setMenuOpen(o => !o)} className="md:hidden"
                style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}
              >
                {menuOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)', padding: '16px 24px' }} className="md:hidden">
              {['How It Works', 'Roles'].map(l => (
                <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`} onClick={() => setMenuOpen(false)}
                  style={{ display: 'block', padding: '12px 0', fontSize: 15, fontWeight: 500, color: 'var(--text-muted)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}
                >{l}</a>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <Link to="/login" className="btn btn-outline" style={{ flex: 1 }}>Sign In</Link>
                <Link to="/login" className="btn btn-accent" style={{ flex: 1 }}>Launch App</Link>
              </div>
            </div>
          )}
        </header>

        <main style={{ paddingTop: 64 }}>
          
          {/* Centered Hero Section without Dashboard image */}
          <section style={{ maxWidth: 840, margin: '0 auto', padding: '120px 24px 96px', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              
              {/* Tagline */}
              <p className="font-display" style={{ fontSize: 'clamp(13px, 2vw, 15px)', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>
                The Future of Transit Starts Here.
              </p>

              <h1 className="font-display" style={{ fontSize: 'clamp(40px, 6.5vw, 68px)', fontWeight: 850, lineHeight: 1.05, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 8 }}>
                Run Your Fleet
              </h1>
              <h1 className="font-display" style={{ fontSize: 'clamp(40px, 6.5vw, 68px)', fontWeight: 850, lineHeight: 1.05, letterSpacing: '-0.03em', color: 'var(--accent)', marginBottom: 28 }}>
                Smarter & Faster.
              </h1>

              <p style={{ fontSize: 17, lineHeight: 1.72, color: 'var(--text-muted)', marginBottom: 38, maxWidth: 520 }}>
                TransitOps helps dispatchers, safety officers, and financial analysts align. Track active dispatches, utilize AI match scoring, and log expenses seamlessly.
              </p>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link to="/login" className="btn btn-primary" style={{ padding: '14px 28px' }}>
                  <Search style={{ width: 16, height: 16 }} />
                  View Live Operations
                </Link>
                <Link to="/login" className="btn btn-outline" style={{ padding: '14px 28px' }}>
                  Quick Account Sign In
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </Link>
              </div>

            </div>
          </section>

          {/* How It Works Section */}
          <section id="how-it-works" style={{ background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
              <div style={{ marginBottom: 48 }}>
                <span className="font-display" style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', tracking: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Workflow</span>
                <h2 className="font-display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
                  Get operational in minutes
                </h2>
              </div>

              <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="step-card" style={{ borderRadius: 16, padding: '36px 30px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div className="step-icon-wrap" style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--bg-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon style={{ width: 20, height: 20, color: 'var(--accent)', margin: 'auto' }} />
                        </div>
                        <span className="font-display step-number" style={{ fontSize: 36, fontWeight: 800, color: 'var(--border)', lineHeight: 1 }}>{s.step}</span>
                      </div>
                      <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>{s.title}</h3>
                      <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--text-muted)' }}>{s.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Roles Access Grid */}
          <section id="roles" style={{ borderBottom: '1px solid var(--border)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
              <div style={{ marginBottom: 48 }}>
                <span className="font-display" style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', tracking: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Authentication</span>
                <h2 className="font-display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
                  Tailored views for every colleague
                </h2>
              </div>

              <div className="roles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {ROLES.map((r, i) => (
                  <div key={i} className="feat-card" style={{ borderRadius: 16, padding: '24px' }}>
                    <span className="font-display text-[11px] font-700 inline-block px-[8px] py-[4px] rounded-[6px] border border-white/10 mb-[16px] select-none" style={{ border: '1px solid var(--border)' }} className={r.color}>
                      {r.name}
                    </span>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{r.access}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Social Proof / Testimonials */}
          <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
            <div style={{ marginBottom: 48 }}>
              <span className="font-display" style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', tracking: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Feedback</span>
              <h2 className="font-display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
                Loved by logistics teams
              </h2>
            </div>

            <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="feat-card" style={{ borderRadius: 16, padding: '30px' }}>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                    {[1,2,3,4,5].map(st => (
                      <Star key={st} style={{ width: 14, height: 14, fill: '#eab308', color: '#eab308' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--text-muted)', marginBottom: 20 }}>"{t.text}"</p>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{t.name}</h4>
                    <p style={{ fontSize: 11, color: 'var(--text-muted2)' }}>{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Call to Action with Accounts */}
          <section style={{ background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
              <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
                <div>
                  <span className="font-display" style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', tracking: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Access</span>
                  <h2 className="font-display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 16 }}>
                    Explore the live platform
                  </h2>
                  <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--text-muted)', marginBottom: 32, maxWidth: 380 }}>
                    Select a workspace credential on the right and check how roles alter access scopes immediately.
                  </p>
                  <Link to="/login" className="btn btn-accent">
                    Launch Fleet Hub
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </Link>
                </div>

                {/* Account credentials */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', uppercase: 'true' }}>DEMO CREDENTIALS — password: transit123</span>
                  </div>
                  {[
                    { role: 'Fleet Manager',     email: 'fleet@transit.com' },
                    { role: 'Driver',            email: 'driver@transit.com' },
                    { role: 'Safety Officer',    email: 'safety@transit.com' },
                    { role: 'Financial Analyst', email: 'finance@transit.com' },
                  ].map((ac, idx, arr) => (
                    <div key={ac.role}
                      style={{ padding: '16px 20px', borderBottom: idx < arr.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{ac.role}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted2)', fontFamily: 'monospace' }}>{ac.email}</p>
                      </div>
                      <Link to="/login" className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 11, borderRadius: 8 }}>
                        Quick Login
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

        </main>

        {/* Upgraded Footer Section */}
        <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)', padding: '80px 24px 40px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 64 }}>
              
              {/* Brand and Description Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Truck style={{ width: 16, height: 16, color: '#fff', margin: 'auto' }} />
                  </div>
                  <span className="font-display" style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)', letterSpacing: '-0.02em' }}>TransitOps</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: 300 }}>
                  A unified control center for transport operations. We combine real-time telemetry tracking, driver rosters, expense logging, and forecasting.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'var(--text-muted2)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Mail style={{ width: 14, height: 14 }} /> contact@transitops.app
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Phone style={{ width: 14, height: 14 }} /> +1 (800) 555-0199
                  </span>
                </div>
              </div>

              {/* Dynamic Link columns */}
              {Object.entries({
                Product: [
                  { label: 'AI Dispatch Advisor', link: '#' },
                  { label: 'Live Telemetry Tracker', link: '#' },
                  { label: 'Financial Cost Reports', link: '#' },
                  { label: 'API Integrations', link: '#' }
                ],
                Colleagues: [
                  { label: 'Fleet Manager Portal', link: '#' },
                  { label: 'Driver Operations', link: '#' },
                  { label: 'Safety Compliance Panel', link: '#' },
                  { label: 'Financial Expense Audits', link: '#' }
                ],
                Resources: [
                  { label: 'User Documentation', link: '#' },
                  { label: 'Help Center Support', link: '#' },
                  { label: 'Privacy Regulations', link: '#' },
                  { label: 'Terms of Use Agreement', link: '#' }
                ]
              }).map(([title, links]) => (
                <div key={title} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', uppercase: 'true', letterSpacing: '0.08em' }}>{title}</h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {links.map(l => (
                      <li key={l.label}>
                        <a href={l.link} style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s, padding-left 0.2s', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          className="foot-link"
                          onMouseEnter={e => { e.target.style.color = 'var(--accent)'; e.target.style.paddingLeft = '4px'; }}
                          onMouseLeave={e => { e.target.style.color = 'var(--text-muted)'; e.target.style.paddingLeft = '0px'; }}
                        >
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom Section */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted2)' }}>
                  © {new Date().getFullYear()} TransitOps Platform. Designed with React + Tailwind CSS.
                </p>
              </div>
              
              {/* Green status indicator badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 20, padding: '6px 14px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 0 2px rgba(16,185,129,0.2)' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#10b981' }}>All Systems Operational</span>
              </div>
            </div>

          </div>
        </footer>

      </div>
    </>
  );
}


