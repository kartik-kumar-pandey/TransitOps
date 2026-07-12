import { useState } from 'react';
import { useMockData } from '../context/MockDataContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import TripTracker from '../components/TripTracker';
import {
  Plus, Check, Play, XCircle, ShieldAlert, Sparkles,
  Navigation, X, Radio, List, Zap, Trophy, Star
} from 'lucide-react';

export default function Trips() {
  const { user } = useAuth();
  const { trips, vehicles, drivers, createTrip, dispatchTrip, completeTrip, cancelTrip } = useMockData();
  const { success, error: notifyError, warning } = useNotification();

  // Tab: 'list' | 'tracker'
  const [tab, setTab] = useState('list');

  // Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);

  // Create form
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [plannedDistance, setPlannedDistance] = useState('');
  const [formError, setFormError] = useState('');

  // Complete form
  const [actualDistance, setActualDistance] = useState('');
  const [fuelConsumed, setFuelConsumed] = useState('');

  // AI
  const [aiRankings, setAiRankings] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const today = new Date();
  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  const availableDrivers  = drivers.filter(d =>
    d.status === 'Available' && new Date(d.licenseExpiryDate) > today
  );

  /* ── Enhanced AI Dispatch Advisor ────────────────────────────── */
  const runAiAdvisor = () => {
    if (!cargoWeight || !plannedDistance) {
      setFormError('Fill in Cargo Weight and Distance first for AI advice.');
      return;
    }
    setIsAiLoading(true);
    setFormError('');

    setTimeout(() => {
      const weight = Number(cargoWeight);
      const dist   = Number(plannedDistance);

      const eligibleVehicles = availableVehicles.filter(v => v.maxLoadCapacity >= weight);
      if (eligibleVehicles.length === 0) {
        setFormError('AI: No available vehicles can carry this cargo weight.');
        setIsAiLoading(false);
        return;
      }
      if (availableDrivers.length === 0) {
        setFormError('AI: No eligible drivers currently available.');
        setIsAiLoading(false);
        return;
      }

      // Score each vehicle × driver pair
      const maxOdo = Math.max(...eligibleVehicles.map(v => v.odometer), 1);
      const pairs = [];
      eligibleVehicles.forEach(v => {
        availableDrivers.forEach(d => {
          // Capacity fit: prefer least headroom (40%)
          const capacityFit = 1 - Math.abs(v.maxLoadCapacity - weight) / v.maxLoadCapacity;
          // Safety score (35%)
          const safetyScore = d.safetyScore / 100;
          // Odometer (lower is better) (10%)
          const odoScore = 1 - v.odometer / maxOdo;
          // License match (15%): Heavy for trucks, medium for vans
          const licenseMatch = (v.type === 'Truck' && d.licenseCategory === 'Heavy') ||
                               (v.type === 'Van'   && d.licenseCategory === 'Medium') ? 1 : 0.5;

          const score = (capacityFit * 0.4 + safetyScore * 0.35 + odoScore * 0.1 + licenseMatch * 0.15) * 100;

          pairs.push({
            vehicle: v, driver: d, score: Math.round(score),
            reason: `${v.nameModel} fits ${weight}kg cargo (cap ${v.maxLoadCapacity}kg). ` +
                    `${d.name} has a ${d.safetyScore}/100 safety score and ` +
                    `${d.licenseCategory} license — ${licenseMatch === 1 ? 'ideal' : 'acceptable'} for this ${v.type}.`,
          });
        });
      });

      // Sort and take top 3 unique (one per vehicle)
      const seen = new Set();
      const top3 = pairs
        .sort((a, b) => b.score - a.score)
        .filter(p => {
          const key = p.vehicle.id + ':' + p.driver.id;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, 3);

      setAiRankings(top3);
      setIsAiLoading(false);
    }, 900);
  };

  const applyRanking = (r) => {
    setVehicleId(r.vehicle.id);
    setDriverId(r.driver.id);
  };

  /* ── Create Trip ─────────────────────────────────────────────── */
  const handleCreate = (e) => {
    e.preventDefault();
    setFormError('');
    const res = createTrip({ source, destination, vehicleId, driverId,
      cargoWeight: Number(cargoWeight), plannedDistance: Number(plannedDistance) });
    if (res.success) {
      success('Trip Created', `Route ${source} → ${destination} saved as Draft.`);
      setSource(''); setDestination(''); setVehicleId(''); setDriverId('');
      setCargoWeight(''); setPlannedDistance(''); setAiRankings([]);
      setIsCreateOpen(false);
    } else {
      setFormError(res.error);
      notifyError('Trip Error', res.error);
    }
  };

  /* ── Dispatch ───────────────────────────────────────────────── */
  const handleDispatch = (tripId) => {
    const res = dispatchTrip(tripId);
    if (res.success) {
      const t = trips.find(t => t.id === tripId);
      success('Trip Dispatched', `Route ${t?.source} → ${t?.destination} is now en route.`);
    } else {
      notifyError('Dispatch Failed', res.error);
    }
  };

  /* ── Complete ───────────────────────────────────────────────── */
  const openCompleteModal = (tripId) => {
    setSelectedTripId(tripId);
    const trip = trips.find(t => t.id === tripId);
    setActualDistance(trip ? trip.plannedDistance.toString() : '');
    setFuelConsumed('');
    setFormError('');
    setIsCompleteOpen(true);
  };

  const handleComplete = (e) => {
    e.preventDefault();
    const res = completeTrip(selectedTripId, Number(actualDistance), Number(fuelConsumed));
    if (res.success) {
      success('Trip Completed', 'Vehicle and driver are now Available again.');
      setIsCompleteOpen(false);
    } else {
      notifyError('Complete Failed', res.error);
    }
  };

  /* ── Cancel ─────────────────────────────────────────────────── */
  const handleCancel = (tripId) => {
    const res = cancelTrip(tripId);
    if (res.success) {
      warning('Trip Cancelled', 'Vehicle and driver statuses have been restored.');
    } else {
      notifyError('Cancel Failed', res.error);
    }
  };

  const statusColors = {
    Draft:      'bg-slate-800 text-slate-400 border-slate-700',
    Dispatched: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Completed:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Cancelled:  'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const rankIcons = [Trophy, Star, Zap];
  const rankColors = ['text-amber-400', 'text-slate-400', 'text-amber-700'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Trip Management</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Plan routes, dispatch drivers, and track live progress.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Tab toggles */}
          <div className="flex rounded-xl border p-1" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)' }}>
            {[['list', List, 'All Trips'], ['tracker', Radio, 'Live Tracker']].map(([t, Icon, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  tab === t ? 'bg-blue-600 text-white shadow' : ''
                }`}
                style={{ color: tab === t ? undefined : 'var(--text-muted)' }}
              >
                <Icon className="h-3.5 w-3.5 mr-1.5" />
                {label}
                {t === 'tracker' && trips.filter(tr => tr.status === 'Dispatched').length > 0 && (
                  <span className="ml-1.5 px-1 bg-emerald-500 text-white text-[9px] rounded-full">
                    {trips.filter(tr => tr.status === 'Dispatched').length}
                  </span>
                )}
              </button>
            ))}
          </div>
          {user?.role === 'fleet_manager' && (
            <button
              onClick={() => { setFormError(''); setAiRankings([]); setIsCreateOpen(true); }}
              className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-200 active:scale-95"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Plan New Trip
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {tab === 'tracker' ? (
        <TripTracker />
      ) : (
        /* Trips Table */
        <div className="glass-panel rounded-2xl border overflow-hidden animate-fade-in"
          style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left" style={{ color: 'var(--text-secondary)' }}>
              <thead className="border-b text-xs font-bold uppercase tracking-wider"
                style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                <tr>
                  {['Route ID','From / To','Vehicle','Driver','Cargo','Distance','Status','Actions'].map(h => (
                    <th key={h} className="px-6 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y text-xs font-medium" style={{ borderColor: 'var(--border-subtle)' }}>
                {trips.length > 0 ? trips.map(t => {
                  const vehicle = vehicles.find(v => v.id === t.vehicleId);
                  const driver  = drivers.find(d => d.id === t.driverId);
                  return (
                    <tr key={t.id} className="transition-colors hover:bg-white/2">
                      <td className="px-6 py-4 font-mono font-bold text-blue-400">{t.id.toUpperCase()}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t.source}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>➔ {t.destination}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p style={{ color: 'var(--text-primary)' }}>{vehicle?.nameModel || '—'}</p>
                        <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{vehicle?.registrationNumber}</p>
                      </td>
                      <td className="px-6 py-4">{driver?.name || '—'}</td>
                      <td className="px-6 py-4">{t.cargoWeight} kg</td>
                      <td className="px-6 py-4">
                        <div>Planned: {t.plannedDistance} km</div>
                        {t.actualDistance && <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Actual: {t.actualDistance} km</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${statusColors[t.status]}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1.5">
                          {t.status === 'Draft' && user?.role === 'fleet_manager' && (
                            <button onClick={() => handleDispatch(t.id)}
                              className="flex items-center px-2 py-1 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors active:scale-95">
                              <Play className="h-3 w-3 mr-1" />Dispatch
                            </button>
                          )}
                          {t.status === 'Dispatched' && (
                            <>
                              <button onClick={() => openCompleteModal(t.id)}
                                className="flex items-center px-2 py-1 bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors active:scale-95">
                                <Check className="h-3 w-3 mr-1" />Complete
                              </button>
                              <button onClick={() => handleCancel(t.id)}
                                className="flex items-center px-2 py-1 bg-red-600/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors active:scale-95">
                                <XCircle className="h-3 w-3 mr-1" />Cancel
                              </button>
                            </>
                          )}
                          {(t.status === 'Completed' || t.status === 'Cancelled') && (
                            <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>
                              {t.status === 'Completed' ? 'Archived' : 'Void'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                      No trips planned yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scale-in"
            style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <h3 className="text-md font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
                <Navigation className="h-5 w-5 mr-2 text-blue-400" />Plan New Route
              </h3>
              <button onClick={() => setIsCreateOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-start space-x-2 animate-slide-up">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Source Hub', val: source, set: setSource, placeholder: 'Chicago Hub' },
                  { label: 'Destination', val: destination, set: setDestination, placeholder: 'Detroit Depot' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
                    <input type="text" required value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                      className="w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-blue-500 transition-colors"
                      style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Cargo Weight (kg)', val: cargoWeight, set: setCargoWeight, placeholder: '500' },
                  { label: 'Planned Distance (km)', val: plannedDistance, set: setPlannedDistance, placeholder: '280' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
                    <input type="number" required value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                      className="w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-blue-500 transition-colors"
                      style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} />
                  </div>
                ))}
              </div>

              {/* AI Advisor */}
              <div className="p-4 rounded-xl border" style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.2)' }}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 flex items-center">
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />AI Dispatch Advisor — Top 3 Matches
                  </span>
                  <button type="button" onClick={runAiAdvisor}
                    className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg transition-colors active:scale-95">
                    {isAiLoading ? 'Analyzing…' : 'Run AI Analysis'}
                  </button>
                </div>

                {aiRankings.length > 0 && (
                  <div className="space-y-2">
                    {aiRankings.map((r, i) => {
                      const RankIcon = rankIcons[i] || Star;
                      const isApplied = vehicleId === r.vehicle.id && driverId === r.driver.id;
                      return (
                        <div key={i}
                          className={`p-3 rounded-xl border text-xs transition-all duration-200 animate-slide-up cursor-pointer
                            ${isApplied ? 'border-violet-400 bg-blue-500/10' : 'border-white/5 bg-white/3 hover:bg-white/6'}`}
                          style={{ animationDelay: `${i * 80}ms` }}
                          onClick={() => applyRanking(r)}
                        >
                          <div className="flex justify-between items-center mb-1.5">
                            <div className="flex items-center space-x-2">
                              <RankIcon className={`h-4 w-4 ${rankColors[i]}`} />
                              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                #{i + 1}: {r.vehicle.nameModel} + {r.driver.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="h-1.5 w-20 rounded-full" style={{ background: 'var(--border-subtle)' }}>
                                <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${r.score}%` }} />
                              </div>
                              <span className="font-black text-blue-400">{r.score}%</span>
                            </div>
                          </div>
                          <p className="text-[10px] italic leading-relaxed" style={{ color: 'var(--text-muted)' }}>"{r.reason}"</p>
                          {isApplied && (
                            <p className="text-[9px] text-emerald-400 font-bold mt-1 flex items-center">
                              <Check className="h-3 w-3 mr-1" />Selection applied
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Vehicle + Driver dropdowns */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Vehicle', val: vehicleId, set: setVehicleId, opts: availableVehicles.map(v => ({ val: v.id, label: `${v.nameModel} (${v.maxLoadCapacity}kg)` })) },
                  { label: 'Driver',  val: driverId,  set: setDriverId,  opts: availableDrivers.map(d => ({ val: d.id, label: `${d.name} (Safety: ${d.safetyScore})` })) },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                      Select {f.label}
                    </label>
                    <select required value={f.val} onChange={e => f.set(e.target.value)}
                      className="w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-blue-500 transition-colors"
                      style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
                      <option value="">-- Choose --</option>
                      {f.opts.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border transition-colors"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold text-white shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                  Create Draft Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {isCompleteOpen && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border shadow-2xl space-y-4 animate-scale-in"
            style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <h3 className="text-md font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
                <Check className="h-5 w-5 mr-2 text-blue-400" />Close Route
              </h3>
              <button onClick={() => setIsCompleteOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleComplete} className="space-y-4">
              {[
                { label: 'Actual Distance (km)', val: actualDistance, set: setActualDistance },
                { label: 'Fuel Consumed (L)',    val: fuelConsumed,   set: setFuelConsumed   },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
                  <input type="number" required value={f.val} onChange={e => f.set(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-blue-500 transition-colors"
                    style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} />
                </div>
              ))}
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setIsCompleteOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border transition-colors"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">
                  Complete & Log Fuel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


