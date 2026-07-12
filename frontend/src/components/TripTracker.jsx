import { useState, useEffect, useRef } from 'react';
import { useMockData } from '../context/MockDataContext';
import { Navigation, Truck, User, CheckCircle2, Clock, Zap } from 'lucide-react';

// Each dispatched trip gets a live animated progress bar that ticks every second
// It simulates completing in 30 seconds (for demo purposes)
const DEMO_DURATION_MS = 30000;

export default function TripTracker() {
  const { trips, vehicles, drivers } = useMockData();
  const [progresses, setProgresses] = useState({});
  const intervalsRef = useRef({});

  const dispatchedTrips = trips.filter(t => t.status === 'Dispatched');

  // Start/manage interval timers for each dispatched trip
  useEffect(() => {
    dispatchedTrips.forEach(trip => {
      if (intervalsRef.current[trip.id]) return; // already running

      const startTime = trip.dispatchedAt ? new Date(trip.dispatchedAt).getTime() : Date.now();
      intervalsRef.current[trip.id] = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(100, Math.round((elapsed / DEMO_DURATION_MS) * 100));
        setProgresses(prev => ({ ...prev, [trip.id]: pct }));
      }, 500);
    });

    // Clean up intervals for trips no longer dispatched
    Object.keys(intervalsRef.current).forEach(id => {
      if (!dispatchedTrips.find(t => t.id === id)) {
        clearInterval(intervalsRef.current[id]);
        delete intervalsRef.current[id];
      }
    });

    return () => {
      // Don't clear on every re-render, only on unmount
    };
  }, [dispatchedTrips.length]);

  // Cleanup all on unmount
  useEffect(() => {
    return () => {
      Object.values(intervalsRef.current).forEach(clearInterval);
    };
  }, []);

  if (dispatchedTrips.length === 0) {
    return (
      <div className="glass-panel rounded-2xl border p-12 flex flex-col items-center justify-center text-center"
        style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="p-4 rounded-2xl bg-blue-500/10 mb-4">
          <Navigation className="h-10 w-10 text-blue-400 animate-bounce-gentle" />
        </div>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No Active Trips</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Dispatch a trip to see live progress tracking here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dispatchedTrips.map((trip, idx) => {
        const vehicle = vehicles.find(v => v.id === trip.vehicleId);
        const driver  = drivers.find(d => d.id === trip.driverId);
        const pct = progresses[trip.id] ?? 0;
        const completed = pct >= 100;

        // Estimate ETA based on pct
        const remainingMs = DEMO_DURATION_MS * (1 - pct / 100);
        const etaSecs = Math.ceil(remainingMs / 1000);
        const etaLabel = completed ? 'Arrived' : etaSecs < 60 ? `~${etaSecs}s` : `~${Math.ceil(etaSecs/60)}m`;

        return (
          <div
            key={trip.id}
            className="glass-panel rounded-2xl border overflow-hidden card-hover animate-slide-up"
            style={{ borderColor: 'var(--border-subtle)', animationDelay: `${idx * 80}ms` }}
          >
            {/* Header row */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Navigation className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {trip.source} <span className="text-blue-400 mx-1">→</span> {trip.destination}
                  </p>
                  <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                    {trip.id.toUpperCase()} • {trip.cargoWeight} kg cargo
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-bold" style={{ color: completed ? '#34d399' : 'var(--text-secondary)' }}>
                  ETA: {etaLabel}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="px-6 pt-4 pb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    {completed ? 'Arrived at destination' : 'En Route'}
                  </span>
                </div>
                <span className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>{pct}%</span>
              </div>

              {/* Track bar */}
              <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500 ease-linear"
                  style={{
                    width: `${pct}%`,
                    background: completed
                      ? 'linear-gradient(90deg, #10b981, #34d399)'
                      : 'linear-gradient(90deg, #7c3aed, #8b5cf6, #a78bfa)',
                  }}
                />
                {/* Glowing dot */}
                {!completed && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-white shadow-lg shadow-violet-500/50 flex items-center justify-center"
                    style={{ left: `${pct}%`, background: '#8b5cf6', transition: 'left 0.5s linear' }}
                  >
                    <Truck className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
                {completed && (
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>

              {/* Mile markers */}
              <div className="flex justify-between mt-1.5 text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                <span>{trip.source}</span>
                <span>{Math.round(trip.plannedDistance * pct / 100)} km / {trip.plannedDistance} km</span>
                <span>{trip.destination}</span>
              </div>
            </div>

            {/* Vehicle + Driver row */}
            <div className="px-6 py-3 grid grid-cols-2 gap-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-blue-400" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Vehicle</p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {vehicle?.nameModel || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-cyan-400" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Driver</p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {driver?.name || 'N/A'} • Score {driver?.safetyScore}/100
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


