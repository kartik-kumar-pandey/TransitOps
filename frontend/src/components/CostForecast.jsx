import { useState } from 'react';
import { useMockData } from '../context/MockDataContext';
import { Sparkles, DollarSign, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CostForecast() {
  const { vehicles, fuelLogs } = useMockData();
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

      // Determine vehicle type class cost factor
      // Trucks are heavier and costlier per km than Vans
      const isTruck = weight > 1200;
      const fuelEfficiency = isTruck ? 6.5 : 11.2; // km per Liter
      const avgFuelPricePerLiter = 2.1; // simulated cost
      
      const fuelCost = (dist / fuelEfficiency) * avgFuelPricePerLiter;
      const tollCost = isTruck ? dist * 0.15 : dist * 0.05; // truck tolls are higher
      const maintenanceProvision = dist * 0.08; // 8 cents per km provision

      const total = fuelCost + tollCost + maintenanceProvision;

      setForecast({
        vehicleClass: isTruck ? 'Heavy Truck Class' : 'Medium Van Class',
        fuelCost: Math.round(fuelCost),
        tollCost: Math.round(tollCost),
        maintCost: Math.round(maintenanceProvision),
        total: Math.round(total)
      });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center space-x-2">
        <div className="p-1.5 bg-violet-600 rounded-lg text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">AI Route Cost Forecaster</h3>
      </div>
      <p className="text-xs text-slate-400">
        Enter route metrics to simulate operational cost projections using current fleet efficiency indexes.
      </p>

      <form onSubmit={calculateForecast} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
            Cargo Weight (kg)
          </label>
          <input
            type="number"
            required
            value={cargoWeight}
            onChange={(e) => setCargoWeight(e.target.value)}
            placeholder="e.g., 800"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
            Estimated Distance (km)
          </label>
          <input
            type="number"
            required
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="e.g., 350"
            className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-505 text-white font-bold py-2.5 rounded-xl text-xs transition-colors active:scale-97 disabled:opacity-40"
        >
          {loading ? 'Analyzing...' : 'Generate Projections'}
        </button>
      </form>

      {forecast && (
        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-3 animate-slide-up">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300">Projected Class: {forecast.vehicleClass}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              Calculated
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-slate-955 rounded-xl border border-slate-850">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Estimated Fuel</span>
              <p className="text-md font-bold text-slate-200 mt-1">${forecast.fuelCost}</p>
            </div>
            <div className="p-3 bg-slate-955 rounded-xl border border-slate-850">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Estimated Tolls</span>
              <p className="text-md font-bold text-slate-200 mt-1">${forecast.tollCost}</p>
            </div>
            <div className="p-3 bg-slate-955 rounded-xl border border-slate-850">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Maint. Provision</span>
              <p className="text-md font-bold text-slate-200 mt-1">${forecast.maintCost}</p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-400">Estimated Total Operational Cost:</span>
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4 text-violet-400" />
              <span className="text-lg font-black text-violet-400">{forecast.total}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
