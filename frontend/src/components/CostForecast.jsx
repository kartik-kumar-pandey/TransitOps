import { useState } from 'react';
import { useMockData } from '../context/MockDataContext';
import { Sparkles, DollarSign, ShieldCheck } from 'lucide-react';

export default function CostForecast() {
  const { vehicles } = useMockData();
  const [cargoWeight, setCargoWeight] = useState('');
  const [distance, setDistance] = useState('');
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateForecast = (e) => {
    e.preventDefault();
    if (!cargoWeight || !distance) return;

    setLoading(true);
    setForecast(null);

    setTimeout(() => {
      const weight = Number(cargoWeight);
      const dist = Number(distance);

      const isTruck = weight > 1200;
      const fuelEfficiency = isTruck ? 6.5 : 11.2; // km per Liter
      const avgFuelPricePerLiter = 2.1; // simulated cost USD
      
      // Calculate costs in USD, then convert to INR (1 USD = 83 INR)
      const fuelCostUSD = (dist / fuelEfficiency) * avgFuelPricePerLiter;
      const tollCostUSD = isTruck ? dist * 0.15 : dist * 0.05;
      const maintenanceUSD = dist * 0.08;

      const fuelCostINR = Math.round(fuelCostUSD * 83);
      const tollCostINR = Math.round(tollCostUSD * 83);
      const maintCostINR = Math.round(maintenanceUSD * 83);
      const totalINR = fuelCostINR + tollCostINR + maintCostINR;

      setForecast({
        vehicleClass: isTruck ? 'Heavy Truck Class' : 'Medium Van Class',
        fuelCost: fuelCostINR,
        tollCost: tollCostINR,
        maintCost: maintCostINR,
        total: totalINR
      });
      setLoading(false);
    }, 800);
  };

  const formatRupees = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div
      className="p-6 rounded-2xl space-y-4 shadow-sm"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center space-x-2">
        <div className="p-1.5 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-600/20">
          <Sparkles className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-wider font-display" style={{ color: 'var(--text-heading)' }}>AI Route Cost Forecaster</h3>
      </div>
      <p className="text-xs text-slate-500">
        Enter route metrics to simulate operational cost projections in Indian Rupees (₹).
      </p>

      <form onSubmit={calculateForecast} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-label)' }}>
            Cargo Weight (kg)
          </label>
          <input
            type="number"
            required
            value={cargoWeight}
            onChange={(e) => setCargoWeight(e.target.value)}
            placeholder="e.g., 800"
            className="w-full rounded-xl px-3 py-2 text-xs transition-colors"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-label)' }}>
            Estimated Distance (km)
          </label>
          <input
            type="number"
            required
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="e.g., 350"
            className="w-full rounded-xl px-3 py-2 text-xs transition-colors"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-blue-600/10 transition-all duration-200 cursor-pointer active:scale-97 disabled:opacity-40"
        >
          {loading ? 'Analyzing...' : 'Generate Projections'}
        </button>
      </form>

      {forecast && (
        <div
          className="p-4 rounded-xl space-y-3 animate-slide-up border"
          style={{ background: 'var(--bg-card-alt)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Projected Class: {forecast.vehicleClass}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              Calculated
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Estimated Fuel</span>
              <p className="text-sm font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{formatRupees(forecast.fuelCost)}</p>
            </div>
            <div className="p-3 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Estimated Tolls</span>
              <p className="text-sm font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{formatRupees(forecast.tollCost)}</p>
            </div>
            <div className="p-3 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Maint. Provision</span>
              <p className="text-sm font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{formatRupees(forecast.maintCost)}</p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 mt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
            <span className="text-xs font-bold animate-pulse-glow" style={{ color: 'var(--text-secondary)' }}>Estimated Total Operational Cost:</span>
            <div className="flex items-center space-x-1">
              <span className="text-md font-black text-blue-500">{formatRupees(forecast.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
