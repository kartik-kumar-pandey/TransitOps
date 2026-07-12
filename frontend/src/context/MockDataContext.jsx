import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('transitops_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }, []);

  // ──────────────────────────────────────────────────────────
  // LOAD ALL DATA FROM DATABASE
  // ──────────────────────────────────────────────────────────
  const loadAllData = useCallback(async () => {
    const token = localStorage.getItem('transitops_token');
    if (!token) {
      setLoading(false);
      return;
    }

    const headers = getHeaders();
    setLoading(true);
    setError(null);

    try {
      const [vRes, dRes, tRes, mRes, fRes, eRes] = await Promise.all([
        fetch(`${API}/vehicles`, { headers }),
        fetch(`${API}/drivers`, { headers }),
        fetch(`${API}/trips`, { headers }),
        fetch(`${API}/maintenance`, { headers }),
        fetch(`${API}/fuel-logs`, { headers }),
        fetch(`${API}/expenses`, { headers }),
      ]);

      // Vehicles
      if (vRes.ok) {
        const data = await vRes.json();
        setVehicles(data.map(v => ({
          id: v.id,
          registrationNumber: v.registrationNumber,
          nameModel: `${v.make} ${v.model}`,
          type: v.type,
          maxLoadCapacity: v.capacityWeight,
          odometer: v.odometer,
          acquisitionCost: v.acquisitionCost,
          status: v.status,
          region: v.region
        })));
      }

      // Drivers
      if (dRes.ok) {
        const data = await dRes.json();
        setDrivers(data.map(d => ({
          id: d.id,
          name: d.name,
          licenseNumber: d.licenseNumber,
          licenseCategory: d.licenseCategory || 'Medium',
          licenseExpiryDate: d.licenseExpiry ? d.licenseExpiry.split('T')[0] : '',
          contactNumber: d.contactNumber || '',
          safetyScore: d.safetyScore,
          status: d.status
        })));
      }

      // Trips
      if (tRes.ok) {
        const data = await tRes.json();
        setTrips(data.map(t => ({
          id: t.id,
          tripNumber: t.tripNumber,
          source: t.origin,
          destination: t.destination,
          vehicleId: t.vehicleId,
          driverId: t.driverId,
          cargoWeight: t.cargoWeight,
          plannedDistance: t.plannedDistance || 0,
          actualDistance: t.actualDistance,
          fuelConsumed: t.fuelConsumed,
          status: t.status,
          dispatchedAt: t.dispatchedAt,
          completedAt: t.completedAt,
          createdAt: t.createdAt
        })));
      }

      // Maintenance Logs
      if (mRes.ok) {
        const data = await mRes.json();
        setMaintenanceLogs(data.map(m => ({
          id: m.id,
          vehicleId: m.vehicleId,
          issueDescription: m.description,
          cost: m.cost,
          status: m.status === 'Open' ? 'Active' : m.status,
          createdAt: m.createdAt,
          closedAt: m.closedAt
        })));
      }

      // Fuel Logs
      if (fRes.ok) {
        const data = await fRes.json();
        setFuelLogs(data.map(f => ({
          id: f.id,
          vehicleId: f.vehicleId,
          tripId: f.tripId || null,
          liters: f.fuelAmount,
          cost: f.cost,
          date: f.loggedAt ? f.loggedAt.split('T')[0] : ''
        })));
      }

      // Expenses
      if (eRes.ok) {
        const data = await eRes.json();
        setExpenses(data.map(e => ({
          id: e.id,
          vehicleId: e.vehicleId,
          type: e.category,
          amount: e.amount,
          date: e.loggedAt ? e.loggedAt.split('T')[0] : '',
          description: e.description
        })));
      }
    } catch (err) {
      console.error('Failed to load data from backend:', err);
      setError('Could not connect to the backend server. Please ensure it is running.');
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    if (user) {
      loadAllData();
    } else {
      // Clear data on logout
      setVehicles([]);
      setDrivers([]);
      setTrips([]);
      setMaintenanceLogs([]);
      setFuelLogs([]);
      setExpenses([]);
      setLoading(false);
    }
  }, [user, loadAllData]);

  // ──────────────────────────────────────────────────────────
  // VEHICLE CRUD
  // ──────────────────────────────────────────────────────────
  const addVehicle = async (vehicle) => {
    try {
      const parts = (vehicle.nameModel || '').split(' ');
      const make = parts[0] || 'Unknown';
      const model = parts.slice(1).join(' ') || 'Model';

      const res = await fetch(`${API}/vehicles`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          registrationNumber: vehicle.registrationNumber,
          make,
          model,
          type: vehicle.type,
          region: vehicle.region,
          odometer: vehicle.odometer,
          acquisitionCost: vehicle.acquisitionCost,
          year: 2026,
          capacityWeight: vehicle.maxLoadCapacity,
          status: vehicle.status || 'Available'
        })
      });

      if (res.ok) {
        await loadAllData();
        return { success: true };
      }
      const err = await res.json();
      return { success: false, error: err.error || 'Failed to add vehicle' };
    } catch (e) {
      return { success: false, error: 'Backend server is not reachable' };
    }
  };

  const updateVehicle = async (id, updatedFields) => {
    try {
      const parts = (updatedFields.nameModel || '').split(' ');
      const make = parts[0] || undefined;
      const model = parts.slice(1).join(' ') || undefined;

      const res = await fetch(`${API}/vehicles/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          registrationNumber: updatedFields.registrationNumber,
          make,
          model,
          type: updatedFields.type,
          region: updatedFields.region,
          odometer: updatedFields.odometer,
          acquisitionCost: updatedFields.acquisitionCost,
          status: updatedFields.status,
          capacityWeight: updatedFields.maxLoadCapacity
        })
      });

      if (res.ok) {
        await loadAllData();
        return { success: true };
      }
      const err = await res.json();
      return { success: false, error: err.error || 'Failed to update vehicle' };
    } catch (e) {
      return { success: false, error: 'Backend server is not reachable' };
    }
  };

  // ──────────────────────────────────────────────────────────
  // DRIVER CRUD
  // ──────────────────────────────────────────────────────────
  const addDriver = async (driver) => {
    try {
      const res = await fetch(`${API}/drivers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: driver.name,
          licenseNumber: driver.licenseNumber,
          licenseExpiry: driver.licenseExpiryDate,
          status: driver.status || 'Available',
          safetyScore: driver.safetyScore
        })
      });

      if (res.ok) {
        await loadAllData();
        return { success: true };
      }
      const err = await res.json();
      return { success: false, error: err.error || 'Failed to add driver' };
    } catch (e) {
      return { success: false, error: 'Backend server is not reachable' };
    }
  };

  const updateDriver = async (id, updatedFields) => {
    try {
      const res = await fetch(`${API}/drivers/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          name: updatedFields.name,
          licenseNumber: updatedFields.licenseNumber,
          licenseExpiry: updatedFields.licenseExpiryDate,
          status: updatedFields.status,
          safetyScore: updatedFields.safetyScore
        })
      });

      if (res.ok) {
        await loadAllData();
        return { success: true };
      }
      const err = await res.json();
      return { success: false, error: err.error || 'Failed to update driver' };
    } catch (e) {
      return { success: false, error: 'Backend server is not reachable' };
    }
  };

  // ──────────────────────────────────────────────────────────
  // TRIP LIFECYCLE
  // ──────────────────────────────────────────────────────────
  const createTrip = async (tripData) => {
    // Client-side pre-validation
    const vehicle = vehicles.find((v) => v.id === tripData.vehicleId);
    const driver = drivers.find((d) => d.id === tripData.driverId);

    if (!vehicle) return { success: false, error: 'Please select a vehicle' };
    if (!driver) return { success: false, error: 'Please select a driver' };
    if (vehicle.status === 'Retired' || vehicle.status === 'In Shop')
      return { success: false, error: 'Selected vehicle is retired or undergoing maintenance' };
    if (driver.status === 'Suspended')
      return { success: false, error: 'Driver profile is currently suspended' };
    if (vehicle.status === 'On Trip')
      return { success: false, error: 'Selected vehicle is currently on another trip' };
    if (driver.status === 'On Trip')
      return { success: false, error: 'Selected driver is currently on another trip' };

    try {
      const res = await fetch(`${API}/trips`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          tripNumber: 'TRIP-' + Date.now().toString().slice(-6),
          vehicleId: tripData.vehicleId,
          driverId: tripData.driverId,
          origin: tripData.source,
          destination: tripData.destination,
          cargoWeight: tripData.cargoWeight
        })
      });

      if (res.ok) {
        await loadAllData();
        return { success: true };
      }
      const err = await res.json();
      return { success: false, error: err.error || 'Failed to create trip' };
    } catch (e) {
      return { success: false, error: 'Backend server is not reachable' };
    }
  };

  const dispatchTrip = async (tripId) => {
    try {
      const res = await fetch(`${API}/trips/${tripId}/dispatch`, {
        method: 'PATCH',
        headers: getHeaders()
      });

      if (res.ok) {
        await loadAllData();
        return { success: true };
      }
      const err = await res.json();
      return { success: false, error: err.error || 'Failed to dispatch trip' };
    } catch (e) {
      return { success: false, error: 'Backend server is not reachable' };
    }
  };

  const completeTrip = async (tripId, actualDistance, fuelConsumed) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return { success: false, error: 'Trip not found' };

    try {
      const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
      const nextOdometer = (vehicle ? vehicle.odometer : 0) + Number(actualDistance);

      const res = await fetch(`${API}/trips/${tripId}/complete`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          odometer: nextOdometer,
          fuelAmount: fuelConsumed || 0,
          fuelCost: Number(fuelConsumed || 0) * 2.1
        })
      });

      if (res.ok) {
        await loadAllData();
        return { success: true };
      }
      const err = await res.json();
      return { success: false, error: err.error || 'Failed to complete trip' };
    } catch (e) {
      return { success: false, error: 'Backend server is not reachable' };
    }
  };

  const cancelTrip = async (tripId) => {
    try {
      const res = await fetch(`${API}/trips/${tripId}/cancel`, {
        method: 'PATCH',
        headers: getHeaders()
      });

      if (res.ok) {
        await loadAllData();
        return { success: true };
      }
      const err = await res.json();
      return { success: false, error: err.error || 'Failed to cancel trip' };
    } catch (e) {
      return { success: false, error: 'Backend server is not reachable' };
    }
  };

  // ──────────────────────────────────────────────────────────
  // MAINTENANCE LOGS
  // ──────────────────────────────────────────────────────────
  const addMaintenanceLog = async (logData) => {
    try {
      const res = await fetch(`${API}/maintenance`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          vehicleId: logData.vehicleId,
          description: logData.issueDescription,
          cost: logData.cost
        })
      });

      if (res.ok) {
        await loadAllData();
        return { success: true };
      }
      const err = await res.json();
      return { success: false, error: err.error || 'Failed to create maintenance log' };
    } catch (e) {
      return { success: false, error: 'Backend server is not reachable' };
    }
  };

  const closeMaintenanceLog = async (logId, finalCost) => {
    try {
      const res = await fetch(`${API}/maintenance/${logId}/close`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ cost: finalCost })
      });

      if (res.ok) {
        await loadAllData();
        return { success: true };
      }
      const err = await res.json();
      return { success: false, error: err.error || 'Failed to close maintenance log' };
    } catch (e) {
      return { success: false, error: 'Backend server is not reachable' };
    }
  };

  // ──────────────────────────────────────────────────────────
  // FUEL LOGS
  // ──────────────────────────────────────────────────────────
  const addFuelLog = async (log) => {
    try {
      const res = await fetch(`${API}/fuel-logs`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          vehicleId: log.vehicleId,
          fuelAmount: log.liters,
          cost: log.cost,
          odometerReading: 0.0
        })
      });

      if (res.ok) {
        await loadAllData();
        return { success: true };
      }
      const err = await res.json();
      return { success: false, error: err.error || 'Failed to log fuel' };
    } catch (e) {
      return { success: false, error: 'Backend server is not reachable' };
    }
  };

  // ──────────────────────────────────────────────────────────
  // EXPENSES
  // ──────────────────────────────────────────────────────────
  const addExpense = async (expense) => {
    try {
      const res = await fetch(`${API}/expenses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          vehicleId: expense.vehicleId,
          description: expense.description,
          amount: expense.amount,
          category: expense.type
        })
      });

      if (res.ok) {
        await loadAllData();
        return { success: true };
      }
      const err = await res.json();
      return { success: false, error: err.error || 'Failed to log expense' };
    } catch (e) {
      return { success: false, error: 'Backend server is not reachable' };
    }
  };

  return (
    <DataContext.Provider
      value={{
        vehicles,
        drivers,
        trips,
        maintenanceLogs,
        fuelLogs,
        expenses,
        loading,
        error,
        addVehicle,
        updateVehicle,
        addDriver,
        updateDriver,
        createTrip,
        dispatchTrip,
        completeTrip,
        cancelTrip,
        addMaintenanceLog,
        closeMaintenanceLog,
        addFuelLog,
        addExpense,
        refreshData: loadAllData
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

// Keep the same export name so all pages continue working without changes
export function useMockData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useMockData must be used within a DataProvider');
  }
  return context;
}

// Also export under new name for future usage
export const useData = useMockData;
export const MockDataProvider = DataProvider;
