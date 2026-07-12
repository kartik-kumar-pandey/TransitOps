import { useState } from 'react';
import { useMockData } from '../context/MockDataContext';
import { useAuth } from '../context/AuthContext';
import CsvImport from '../components/CsvImport';
import { Plus, Search, Edit2, ShieldAlert, X, User, AlertTriangle, Trophy, Star } from 'lucide-react';

export default function Drivers() {
  const { user } = useAuth();
  const { drivers, addDriver, updateDriver } = useMockData();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    licenseCategory: 'Medium',
    licenseExpiryDate: '',
    contactNumber: '',
    safetyScore: '100',
    status: 'Available'
  });
  const [error, setError] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);

  const isManagerOrSafety = user?.role === 'fleet_manager' || user?.role === 'safety_officer';

  // Safety Leaderboard & Expiry risk calculation
  const sortedBySafety = [...drivers].sort((a, b) => b.safetyScore - a.safetyScore);

  const getLicenseRiskDrivers = () => {
    const today = new Date();
    return drivers.filter((d) => {
      const expiry = new Date(d.licenseExpiryDate);
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 14;
    });
  };

  const riskDrivers = getLicenseRiskDrivers();

  // Apply search and filters
  const filteredDrivers = drivers.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All' || d.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const checkLicenseExpired = (expiryDateStr) => {
    const today = new Date();
    const expiry = new Date(expiryDateStr);
    return expiry < today;
  };

  const openAddModal = () => {
    setError('');
    setEditingDriver(null);
    setFormData({
      name: '',
      licenseNumber: '',
      licenseCategory: 'Medium',
      licenseExpiryDate: '',
      contactNumber: '',
      safetyScore: '100',
      status: 'Available'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (d) => {
    setError('');
    setEditingDriver(d);
    setFormData({
      name: d.name,
      licenseNumber: d.licenseNumber,
      licenseCategory: d.licenseCategory,
      licenseExpiryDate: d.licenseExpiryDate,
      contactNumber: d.contactNumber,
      safetyScore: d.safetyScore.toString(),
      status: d.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name: formData.name,
      licenseNumber: formData.licenseNumber,
      licenseCategory: formData.licenseCategory,
      licenseExpiryDate: formData.licenseExpiryDate,
      contactNumber: formData.contactNumber,
      safetyScore: Number(formData.safetyScore),
      status: formData.status
    };

    if (editingDriver) {
      const res = await updateDriver(editingDriver.id, payload);
      if (res.success) {
        setIsModalOpen(false);
      } else {
        setError(res.error || 'Failed to update driver');
      }
    } else {
      const res = await addDriver(payload);
      if (res.success) {
        setIsModalOpen(false);
      } else {
        setError(res.error || 'Failed to add driver');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Driver Profiles</h2>
          <p className="text-sm text-slate-400">Manage credentials, license statuses, and safety scores for dispatch operators.</p>
        </div>
        {isManagerOrSafety && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsImportOpen(!isImportOpen)}
              className="flex items-center px-4 py-2.5 bg-slate-805 hover:bg-slate-750 text-slate-200 border border-slate-750 font-semibold text-xs rounded-xl shadow-lg transition-colors"
            >
              Bulk Import CSV
            </button>
            <button
              onClick={openAddModal}
              className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all duration-200 animate-pulse-glow"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add New Driver
            </button>
          </div>
        )}
      </div>

      {/* CSV Bulk Import Section */}
      {isImportOpen && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 animate-slide-up">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">Bulk Driver CSV Import</h3>
          <CsvImport
            entityName="Driver"
            columns={[
              { key: 'name', label: 'Name', required: true },
              { key: 'licenseNumber', label: 'License Number', required: true },
              { key: 'licenseCategory', label: 'License Category', required: true },
              { key: 'licenseExpiryDate', label: 'License Expiry Date', required: true },
              { key: 'contactNumber', label: 'Contact Number', required: true },
              { key: 'safetyScore', label: 'Safety Score', required: true, type: 'number' },
              { key: 'status', label: 'Status', required: true }
            ]}
            sampleCsv={`name,licenseNumber,licenseCategory,licenseExpiryDate,contactNumber,safetyScore,status\nJohn Doe,DL-11002,Heavy,2028-09-12,+1-555-0988,95,Available\nJane Smith,DL-33921,Medium,2027-04-20,+1-555-2201,89,Available`}
            onImport={addDriver}
          />
        </div>
      )}

      {/* License Expiry Risk Summary */}
      {riskDrivers.length > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs flex items-start space-x-3 animate-slide-up">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-slate-205 mb-1">License Expiry Risk Alert</h4>
            <p className="leading-relaxed text-slate-400">
              The following drivers have licenses expiring in the next 14 days and require immediate renewal to avoid route dispatch blocks:{' '}
              {riskDrivers.map((d, i) => (
                <span key={d.id} className="font-semibold text-amber-300">
                  {d.name} ({d.licenseExpiryDate}){i < riskDrivers.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
          </div>
        </div>
      )}

      {/* Driver Safety Leaderboard */}
      {sortedBySafety.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
            <Trophy className="h-4.5 w-4.5 mr-1.5 text-amber-400 animate-bounce-gentle" />
            Safety Leaderboard
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sortedBySafety.slice(0, 3).map((d, i) => (
              <div
                key={d.id}
                className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between card-hover"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl font-bold">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{d.name}</h4>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Rank #{i + 1}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-md font-black text-slate-100">{d.safetyScore}</span>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Safety rating</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search Driver Name or License Number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-955 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="Off Duty">Off Duty</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-slate-300">
            <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Driver Name</th>
                <th className="px-6 py-4">License Number</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">License Expiry</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Safety Score</th>
                <th className="px-6 py-4">Status</th>
                {isManagerOrSafety && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-medium">
              {filteredDrivers.length > 0 ? (
                filteredDrivers.map((d) => {
                  const isExpired = checkLicenseExpired(d.licenseExpiryDate);
                  return (
                    <tr key={d.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-100 flex items-center space-x-2.5">
                        <div className="p-1.5 bg-slate-800 rounded-lg text-slate-400">
                          <User className="h-4 w-4" />
                        </div>
                        <span>{d.name}</span>
                      </td>
                      <td className="px-6 py-4 font-mono">{d.licenseNumber}</td>
                      <td className="px-6 py-4">{d.licenseCategory}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center">
                          {d.licenseExpiryDate}
                          {isExpired && (
                            <span
                              className="ml-2 flex items-center text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-md font-bold uppercase"
                              title="Driver license has expired! Blocked from trips."
                            >
                              <AlertTriangle className="h-3 w-3 mr-0.5" />
                              Expired
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">{d.contactNumber}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`font-extrabold ${
                              d.safetyScore >= 90
                                ? 'text-emerald-400'
                                : d.safetyScore >= 70
                                ? 'text-amber-400'
                                : 'text-red-400'
                            }`}
                          >
                            {d.safetyScore}
                          </span>
                          <span className="text-[10px] text-slate-500">/ 100</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                            d.status === 'Available'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : d.status === 'On Trip'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : d.status === 'Suspended'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      {isManagerOrSafety && (
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openEditModal(d)}
                            disabled={d.status === 'On Trip'}
                            className="p-1.5 bg-slate-800 hover:bg-blue-600/30 hover:text-blue-400 border border-slate-700 hover:border-blue-500/20 rounded-lg text-slate-400 transition-colors disabled:opacity-30 disabled:hover:bg-slate-800"
                            title={d.status === 'On Trip' ? 'Cannot edit driver on trip' : 'Edit profile'}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isManagerOrSafety ? 8 : 7} className="px-6 py-8 text-center text-slate-500">
                    No drivers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-850 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-md font-bold text-slate-100">
                {editingDriver ? 'Edit Driver Profile' : 'Register New Driver'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center space-x-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alex Smith"
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-violet-505"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    License Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    placeholder="e.g. DL-99211"
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-violet-505"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    License Category
                  </label>
                  <select
                    value={formData.licenseCategory}
                    onChange={(e) => setFormData({ ...formData, licenseCategory: e.target.value })}
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-violet-505"
                  >
                    <option value="Medium">Medium (Vans)</option>
                    <option value="Heavy">Heavy (Trucks)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    License Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.licenseExpiryDate}
                    onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-505"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="e.g. +1-555-0192"
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-violet-505"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Safety Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formData.safetyScore}
                    onChange={(e) => setFormData({ ...formData, safetyScore: e.target.value })}
                    placeholder="100"
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-505"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-955 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-violet-505"
                >
                  <option value="Available">Available</option>
                  <option value="Off Duty">Off Duty</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800/60 rounded-xl text-xs font-semibold text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold text-white shadow-lg shadow-blue-600/20"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


