import { useState } from 'react';
import { useMockData } from '../context/MockDataContext';
import { Plus, Check, ShieldAlert, X, Wrench } from 'lucide-react';

export default function Maintenance() {
  const {
    maintenanceLogs,
    vehicles,
    addMaintenanceLog,
    closeMaintenanceLog
  } = useMockData();

  // Dialog controllers
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState(null);

  // Form states
  const [vehicleId, setVehicleId] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [cost, setCost] = useState('');
  const [error, setError] = useState('');

  // Close log states
  const [finalCost, setFinalCost] = useState('');

  // Show only vehicles not retired for maintenance
  const eligibleVehicles = vehicles.filter((v) => v.status !== 'Retired' && v.status !== 'On Trip');

  const handleCreateLog = (e) => {
    e.preventDefault();
    setError('');

    if (!vehicleId || !issueDescription || !cost) {
      setError('Please fill in all fields.');
      return;
    }

    const res = addMaintenanceLog({
      vehicleId,
      issueDescription,
      cost: Number(cost)
    });

    if (res.success) {
      setVehicleId('');
      setIssueDescription('');
      setCost('');
      setIsCreateOpen(false);
    } else {
      setError(res.error || 'Failed to create maintenance log');
    }
  };

  const openCloseModal = (logId) => {
    setSelectedLogId(logId);
    const log = maintenanceLogs.find((l) => l.id === logId);
    setFinalCost(log ? log.cost.toString() : '');
    setError('');
    setIsCloseOpen(true);
  };

  const handleCloseLogSubmit = (e) => {
    e.preventDefault();
    const res = closeMaintenanceLog(selectedLogId, Number(finalCost));
    if (res.success) {
      setIsCloseOpen(false);
    } else {
      setError(res.error || 'Failed to close maintenance log');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Maintenance Records</h2>
          <p className="text-sm text-slate-400">Track service logs, schedule repairs, and monitor vehicle shop time.</p>
        </div>
        <button
          onClick={() => {
            setError('');
            setIsCreateOpen(true);
          }}
          className="flex items-center px-4 py-2.5 bg-violet-600 hover:bg-violet-505 text-white font-semibold text-xs rounded-xl shadow-lg shadow-violet-600/20"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create Maintenance Log
        </button>
      </div>

      {/* Logs Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-slate-300">
            <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Log ID</th>
                <th className="px-6 py-4">Vehicle Model</th>
                <th className="px-6 py-4">Registration</th>
                <th className="px-6 py-4">Service Description</th>
                <th className="px-6 py-4">Estimated Cost</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date Logged</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-medium">
              {maintenanceLogs.length > 0 ? (
                maintenanceLogs.map((l) => {
                  const vehicle = vehicles.find((v) => v.id === l.vehicleId);
                  return (
                    <tr key={l.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-violet-400">{l.id.toUpperCase()}</td>
                      <td className="px-6 py-4 font-semibold text-slate-200">
                        {vehicle ? vehicle.nameModel : 'Unknown Vehicle'}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-400">
                        {vehicle ? vehicle.registrationNumber : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-slate-300">{l.issueDescription}</td>
                      <td className="px-6 py-4 font-semibold">${l.cost.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                            l.status === 'Active'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(l.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {l.status === 'Active' ? (
                          <button
                            onClick={() => openCloseModal(l.id)}
                            className="flex items-center ml-auto px-2 py-1 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Close Log
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Resolved</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    No active maintenance logs.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan New Maintenance Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-850 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-md font-bold text-slate-100 flex items-center">
                <Wrench className="h-5 w-5 mr-2 text-violet-400" />
                Schedule Maintenance
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center space-x-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateLog} className="space-y-4">
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
                  <option value="">-- Select Vehicle --</option>
                  {eligibleVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nameModel} ({v.registrationNumber}) - {v.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Issue Description
                </label>
                <textarea
                  required
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Describe the issues or scheduled work..."
                  rows="3"
                  className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-505 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Estimated Repair Cost ($)
                </label>
                <input
                  type="number"
                  required
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-505"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800/60 rounded-xl text-xs font-semibold text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-xs font-semibold text-white shadow-lg shadow-violet-600/20"
                >
                  Save Log & Pull Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Maintenance Modal */}
      {isCloseOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-855 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-md font-bold text-slate-100 flex items-center">
                <Check className="h-5 w-5 mr-2 text-violet-400" />
                Close Resolved Log
              </h3>
              <button onClick={() => setIsCloseOpen(false)} className="text-slate-500 hover:text-slate-350">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center space-x-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCloseLogSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Final Billing Cost ($)
                </label>
                <input
                  type="number"
                  required
                  value={finalCost}
                  onChange={(e) => setFinalCost(e.target.value)}
                  placeholder="e.g. 520"
                  className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-205 focus:outline-none focus:border-violet-505"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCloseOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800/60 rounded-xl text-xs font-semibold text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-650 hover:bg-emerald-600 rounded-xl text-xs font-semibold text-white shadow-lg shadow-emerald-600/20"
                >
                  Resolve & Restore Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
