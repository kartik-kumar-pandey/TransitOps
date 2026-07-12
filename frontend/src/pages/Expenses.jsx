import { useState } from 'react';
import { useMockData } from '../context/MockDataContext';
import { Plus, ShieldAlert, X, CircleDollarSign, Landmark, Droplets } from 'lucide-react';

export default function Expenses() {
  const {
    vehicles,
    fuelLogs,
    expenses,
    addFuelLog,
    addExpense
  } = useMockData();

  // Dialog controls
  const [isFuelOpen, setIsFuelOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);

  // Form states
  const [vehicleId, setVehicleId] = useState('');
  const [liters, setLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);

  const [expenseVehicleId, setExpenseVehicleId] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseType, setExpenseType] = useState('Toll');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseDesc, setExpenseDesc] = useState('');

  const [error, setError] = useState('');

  const handleFuelSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!vehicleId || !liters || !fuelCost || !logDate) {
      setError('Please fill in all fields.');
      return;
    }

    const res = addFuelLog({
      vehicleId,
      liters: Number(liters),
      cost: Number(fuelCost),
      date: logDate
    });

    if (res.success) {
      setVehicleId('');
      setLiters('');
      setFuelCost('');
      setIsFuelOpen(false);
    } else {
      setError(res.error || 'Failed to log fuel');
    }
  };

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!expenseVehicleId || !expenseAmount || !expenseType || !expenseDate || !expenseDesc) {
      setError('Please fill in all fields.');
      return;
    }

    const res = addExpense({
      vehicleId: expenseVehicleId,
      amount: Number(expenseAmount),
      type: expenseType,
      date: expenseDate,
      description: expenseDesc
    });

    if (res.success) {
      setExpenseVehicleId('');
      setExpenseAmount('');
      setExpenseDesc('');
      setIsExpenseOpen(false);
    } else {
      setError(res.error || 'Failed to log expense');
    }
  };

  // Group operational costs by vehicle
  const computeVehicleOperationalCosts = () => {
    return vehicles.map((v) => {
      // Sum up fuel logs for this vehicle
      const vehicleFuelCost = fuelLogs
        .filter((f) => f.vehicleId === v.id)
        .reduce((sum, item) => sum + item.cost, 0);

      // Sum up expenses for this vehicle
      const vehicleExpenses = expenses
        .filter((e) => e.vehicleId === v.id)
        .reduce((sum, item) => sum + item.amount, 0);

      return {
        ...v,
        totalFuel: vehicleFuelCost,
        totalExpenses: vehicleExpenses,
        totalOpCost: vehicleFuelCost + vehicleExpenses
      };
    });
  };

  const vehicleOpCosts = computeVehicleOperationalCosts();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Fuel & Expense Log</h2>
          <p className="text-sm text-slate-400">Record fuel consumption, tolls, and calculate cumulative operational costs.</p>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={() => {
              setError('');
              setIsFuelOpen(true);
            }}
            className="flex-1 md:flex-none flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-violet-505 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/20"
          >
            <Droplets className="h-4 w-4 mr-1.5" />
            Log Fuel Fill
          </button>
          <button
            onClick={() => {
              setError('');
              setIsExpenseOpen(true);
            }}
            className="flex-1 md:flex-none flex items-center justify-center px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-750 font-semibold text-xs rounded-xl shadow-lg"
          >
            <CircleDollarSign className="h-4 w-4 mr-1.5" />
            Record Expense
          </button>
        </div>
      </div>

      {/* Operational Costs rollup per vehicle */}
      <div className="space-y-4">
        <h3 className="text-md font-bold text-slate-200 flex items-center">
          <Landmark className="h-5 w-5 mr-2 text-blue-400" />
          Vehicle Cumulative Operational Costs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicleOpCosts.map((v) => (
            <div key={v.id} className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-100 truncate">{v.nameModel}</p>
                <span className="text-[10px] text-slate-500 font-mono tracking-wider">{v.registrationNumber}</span>
              </div>
              <div className="mt-4 space-y-2 border-t border-b border-slate-800/60 py-3 my-3">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Fuel Costs:</span>
                  <span className="font-semibold text-slate-200">${v.totalFuel.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Other Expenses:</span>
                  <span className="font-semibold text-slate-200">${v.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Operational:</span>
                <span className="text-xl font-black text-blue-400">${v.totalOpCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expense History Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/30">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Transaction Logs</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-slate-300">
            <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-medium">
              {expenses.length > 0 ? (
                [...expenses]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((e) => {
                    const vehicle = vehicles.find((v) => v.id === e.vehicleId);
                    return (
                      <tr key={e.id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="px-6 py-4 text-slate-400">{e.date}</td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-200">
                            {vehicle ? vehicle.nameModel : 'Unknown Vehicle'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                              e.type === 'Toll'
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}
                          >
                            {e.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 max-w-sm truncate">{e.description}</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-100">${e.amount.toFixed(2)}</td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No logged expenses.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fuel Log Modal */}
      {isFuelOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-850 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-md font-bold text-slate-100 flex items-center">
                <Droplets className="h-5 w-5 mr-2 text-blue-400" />
                Record Fuel Purchase
              </h3>
              <button onClick={() => setIsFuelOpen(false)} className="text-slate-500 hover:text-slate-350">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center space-x-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFuelSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Select Vehicle
                </label>
                <select
                  required
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full bg-slate-955 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-305 focus:outline-none focus:border-violet-505"
                >
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles.filter(v => v.status !== 'Retired').map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nameModel} ({v.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Liters Purchased
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={liters}
                    onChange={(e) => setLiters(e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-205 focus:outline-none focus:border-violet-505"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Total Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    placeholder="e.g. 90.00"
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-205 focus:outline-none focus:border-violet-505"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Fill Date
                </label>
                <input
                  type="date"
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-205 focus:outline-none focus:border-violet-505"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFuelOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800/60 rounded-xl text-xs font-semibold text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-violet-505 rounded-xl text-xs font-semibold text-white shadow-lg shadow-blue-600/20"
                >
                  Log Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-855 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-md font-bold text-slate-100 flex items-center">
                <CircleDollarSign className="h-5 w-5 mr-2 text-blue-400" />
                Record General Expense
              </h3>
              <button onClick={() => setIsExpenseOpen(false)} className="text-slate-500 hover:text-slate-350">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center space-x-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Select Vehicle
                </label>
                <select
                  required
                  value={expenseVehicleId}
                  onChange={(e) => setExpenseVehicleId(e.target.value)}
                  className="w-full bg-slate-955 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-305 focus:outline-none focus:border-violet-505"
                >
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nameModel} ({v.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Expense Type
                  </label>
                  <select
                    value={expenseType}
                    onChange={(e) => setExpenseType(e.target.value)}
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-305 focus:outline-none focus:border-violet-505"
                  >
                    <option value="Toll">Toll Fee</option>
                    <option value="Other">Other Operational</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="e.g. 25.00"
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-205 focus:outline-none focus:border-violet-505"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Transaction Date
                </label>
                <input
                  type="date"
                  required
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-205 focus:outline-none focus:border-violet-505"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Transaction Description
                </label>
                <input
                  type="text"
                  required
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="e.g. Lincoln Tunnel Toll"
                  className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-202 focus:outline-none focus:border-violet-505"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800/60 rounded-xl text-xs font-semibold text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-violet-505 rounded-xl text-xs font-semibold text-white shadow-lg shadow-blue-600/20"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


