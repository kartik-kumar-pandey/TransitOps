import { useState } from 'react';
import { useMockData } from '../context/MockDataContext';
import { useAuth } from '../context/AuthContext';
import CsvImport from '../components/CsvImport';
import { Plus, Search, Edit2, ShieldAlert, X, Truck } from 'lucide-react';

export default function Vehicles() {
  const { user } = useAuth();
  const { vehicles, addVehicle, updateVehicle } = useMockData();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');

  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    registrationNumber: '',
    nameModel: '',
    type: 'Van',
    maxLoadCapacity: '',
    odometer: '',
    acquisitionCost: '',
    region: 'North',
    status: 'Available'
  });
  const [error, setError] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);

  const isFleetManager = user?.role === 'fleet_manager';

  // Apply search and filters
  const filteredVehicles = vehicles.filter((v) => {
    const matchSearch =
      v.nameModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All' || v.status === statusFilter;
    const matchType = typeFilter === 'All' || v.type === typeFilter;
    const matchRegion = regionFilter === 'All' || v.region === regionFilter;

    return matchSearch && matchStatus && matchType && matchRegion;
  });

  const openAddModal = () => {
    setError('');
    setEditingVehicle(null);
    setFormData({
      registrationNumber: '',
      nameModel: '',
      type: 'Van',
      maxLoadCapacity: '',
      odometer: '',
      acquisitionCost: '',
      region: 'North',
      status: 'Available'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (v) => {
    setError('');
    setEditingVehicle(v);
    setFormData({
      registrationNumber: v.registrationNumber,
      nameModel: v.nameModel,
      type: v.type,
      maxLoadCapacity: v.maxLoadCapacity.toString(),
      odometer: v.odometer.toString(),
      acquisitionCost: v.acquisitionCost.toString(),
      region: v.region,
      status: v.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (editingVehicle) {
      const res = updateVehicle(editingVehicle.id, {
        registrationNumber: formData.registrationNumber,
        nameModel: formData.nameModel,
        type: formData.type,
        maxLoadCapacity: Number(formData.maxLoadCapacity),
        odometer: Number(formData.odometer),
        acquisitionCost: Number(formData.acquisitionCost),
        region: formData.region,
        status: formData.status
      });

      if (res.success) {
        setIsModalOpen(false);
      } else {
        setError(res.error);
      }
    } else {
      const res = addVehicle({
        registrationNumber: formData.registrationNumber,
        nameModel: formData.nameModel,
        type: formData.type,
        maxLoadCapacity: Number(formData.maxLoadCapacity),
        odometer: Number(formData.odometer),
        acquisitionCost: Number(formData.acquisitionCost),
        region: formData.region,
        status: formData.status
      });

      if (res.success) {
        setIsModalOpen(false);
      } else {
        setError(res.error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Vehicle Registry</h2>
          <p className="text-sm text-slate-400">View and manage fleet vehicles and their operational statuses.</p>
        </div>
        {isFleetManager && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsImportOpen(!isImportOpen)}
              className="flex items-center px-4 py-2.5 bg-slate-805 hover:bg-slate-750 text-slate-200 border border-slate-750 font-semibold text-xs rounded-xl shadow-lg transition-colors"
            >
              Bulk Import CSV
            </button>
            <button
              onClick={openAddModal}
              className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-violet-505 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add New Vehicle
            </button>
          </div>
        )}
      </div>

      {/* CSV Bulk Import Section */}
      {isImportOpen && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 animate-slide-up">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">Bulk Vehicle CSV Import</h3>
          <CsvImport
            entityName="Vehicle"
            columns={[
              { key: 'registrationNumber', label: 'Registration Number', required: true },
              { key: 'nameModel', label: 'Name Model', required: true },
              { key: 'type', label: 'Type', required: true },
              { key: 'maxLoadCapacity', label: 'Max Load Capacity', required: true, type: 'number' },
              { key: 'odometer', label: 'Odometer', required: true, type: 'number' },
              { key: 'acquisitionCost', label: 'Acquisition Cost', required: true, type: 'number' },
              { key: 'region', label: 'Region', required: true },
              { key: 'status', label: 'Status', required: true }
            ]}
            sampleCsv={`registrationNumber,nameModel,type,maxLoadCapacity,odometer,acquisitionCost,region,status\nREG-1002,Dodge Caravan,Van,900,12000,24000,North,Available\nREG-1003,Freightliner M2,Truck,7000,45000,85000,East,Available`}
            onImport={addVehicle}
          />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search Registration or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Types</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
          </select>
        </div>

        <div>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Regions</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </select>
        </div>
      </div>

      {/* Vehicles Table / Grid */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-slate-300">
            <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Vehicle Model</th>
                <th className="px-6 py-4">Reg Number</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Max Capacity</th>
                <th className="px-6 py-4">Odometer</th>
                <th className="px-6 py-4">Acquisition Cost</th>
                <th className="px-6 py-4">Region</th>
                <th className="px-6 py-4">Status</th>
                {isFleetManager && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-medium">
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-100 flex items-center space-x-2.5">
                      <div className="p-1.5 bg-slate-800 rounded-lg text-slate-400">
                        <Truck className="h-4 w-4" />
                      </div>
                      <span>{v.nameModel}</span>
                    </td>
                    <td className="px-6 py-4 font-mono">{v.registrationNumber}</td>
                    <td className="px-6 py-4">{v.type}</td>
                    <td className="px-6 py-4">{v.maxLoadCapacity} kg</td>
                    <td className="px-6 py-4">{v.odometer.toLocaleString()} km</td>
                    <td className="px-6 py-4">₹{(v.acquisitionCost * 83).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">{v.region}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                          v.status === 'Available'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : v.status === 'On Trip'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : v.status === 'In Shop'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    {isFleetManager && (
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openEditModal(v)}
                          disabled={v.status === 'On Trip'}
                          className="p-1.5 bg-slate-800 hover:bg-blue-600/30 hover:text-blue-400 border border-slate-700 hover:border-blue-500/20 rounded-lg text-slate-400 transition-colors disabled:opacity-30 disabled:hover:bg-slate-800 disabled:hover:text-slate-400"
                          title={v.status === 'On Trip' ? 'Cannot edit active vehicle' : 'Edit vehicle'}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isFleetManager ? 9 : 8} className="px-6 py-8 text-center text-slate-500">
                    No vehicles found matching filters.
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
                {editingVehicle ? 'Edit Vehicle Info' : 'Register New Vehicle'}
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
                    Registration Number
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingVehicle}
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder="e.g. REG-1234"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-violet-505 disabled:opacity-40"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Model Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameModel}
                    onChange={(e) => setFormData({ ...formData, nameModel: e.target.value })}
                    placeholder="e.g. Ford Transit"
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-violet-505"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-violet-505"
                  >
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Max Capacity (kg)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.maxLoadCapacity}
                    onChange={(e) => setFormData({ ...formData, maxLoadCapacity: e.target.value })}
                    placeholder="e.g. 1000"
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-505"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Odometer (km)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.odometer}
                    onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                    placeholder="e.g. 50000"
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-505"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Acquisition Cost (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.acquisitionCost}
                    onChange={(e) => setFormData({ ...formData, acquisitionCost: e.target.value })}
                    placeholder="e.g. 2900000"
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-505"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Region
                  </label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-violet-505"
                  >
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                  </select>
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
                    <option value="In Shop">In Shop</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
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
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


