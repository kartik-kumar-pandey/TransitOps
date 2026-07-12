import { createContext, useContext, useState, useEffect } from 'react';

const MockDataContext = createContext(null);

const INITIAL_VEHICLES = [
  { id: 'v1', registrationNumber: 'REG-001', nameModel: 'Ford Transit Van-01', type: 'Van', maxLoadCapacity: 1000, odometer: 15200, acquisitionCost: 32000, status: 'Available', region: 'North' },
  { id: 'v2', registrationNumber: 'REG-002', nameModel: 'Mercedes Sprinter Van-02', type: 'Van', maxLoadCapacity: 1200, odometer: 24500, acquisitionCost: 38000, status: 'Available', region: 'South' },
  { id: 'v3', registrationNumber: 'REG-003', nameModel: 'Volvo Heavy Truck-01', type: 'Truck', maxLoadCapacity: 8000, odometer: 112000, acquisitionCost: 95000, status: 'In Shop', region: 'East' },
  { id: 'v4', registrationNumber: 'REG-004', nameModel: 'Isuzu Medium Truck-02', type: 'Truck', maxLoadCapacity: 4500, odometer: 215000, acquisitionCost: 55000, status: 'Retired', region: 'West' }
];

const INITIAL_DRIVERS = [
  { id: 'd1', name: 'Alex Smith', licenseNumber: 'DL-99211', licenseCategory: 'Heavy', licenseExpiryDate: '2027-12-31', contactNumber: '+1-555-0192', safetyScore: 92, status: 'Available' },
  { id: 'd2', name: 'Maria Jones', licenseNumber: 'DL-38829', licenseCategory: 'Medium', licenseExpiryDate: '2026-10-15', contactNumber: '+1-555-0143', safetyScore: 88, status: 'Available' },
  { id: 'd3', name: 'David Miller', licenseNumber: 'DL-12290', licenseCategory: 'Heavy', licenseExpiryDate: '2028-04-12', contactNumber: '+1-555-0188', safetyScore: 45, status: 'Suspended' },
  { id: 'd4', name: 'Sarah Connor', licenseNumber: 'DL-00219', licenseCategory: 'Medium', licenseExpiryDate: '2025-01-01', contactNumber: '+1-555-0121', safetyScore: 95, status: 'Available' } // Expired license
];

const INITIAL_TRIPS = [
  { id: 't1', source: 'Chicago Hub', destination: 'Detroit Depot', vehicleId: 'v1', driverId: 'd1', cargoWeight: 800, plannedDistance: 280, actualDistance: null, fuelConsumed: null, status: 'Draft', dispatchedAt: null, completedAt: null, createdAt: '2026-07-10T10:00:00Z' }
];

const INITIAL_MAINTENANCE = [
  { id: 'm1', vehicleId: 'v3', issueDescription: 'Scheduled 100k transmission service', cost: 1200, status: 'Active', createdAt: '2026-07-11T08:00:00Z', closedAt: null }
];

const INITIAL_FUEL_LOGS = [
  { id: 'f1', vehicleId: 'v1', tripId: null, liters: 45, cost: 94.5, date: '2026-07-09' },
  { id: 'f2', vehicleId: 'v2', tripId: null, liters: 50, cost: 110.0, date: '2026-07-10' }
];

const INITIAL_EXPENSES = [
  { id: 'e1', vehicleId: 'v1', type: 'Toll', amount: 15.0, date: '2026-07-09', description: 'I-90 Expressway Toll' },
  { id: 'e2', vehicleId: 'v3', type: 'Other', amount: 1200.0, date: '2026-07-11', description: 'Maintenance Log Cost' } // Auto-generated expense
];

export function MockDataProvider({ children }) {
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
  const [trips, setTrips] = useState(INITIAL_TRIPS);
  const [maintenanceLogs, setMaintenanceLogs] = useState(INITIAL_MAINTENANCE);
  const [fuelLogs, setFuelLogs] = useState(INITIAL_FUEL_LOGS);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);

  // ----------------------------------------------------
  // VEHICLE CRUD
  // ----------------------------------------------------
  const addVehicle = (vehicle) => {
    // Unique registration validation
    const exists = vehicles.some(
      (v) => v.registrationNumber.toUpperCase() === vehicle.registrationNumber.toUpperCase()
    );
    if (exists) {
      return { success: false, error: 'Vehicle Registration Number must be unique' };
    }

    const newVehicle = {
      ...vehicle,
      id: 'v_' + Date.now(),
      odometer: Number(vehicle.odometer) || 0,
      maxLoadCapacity: Number(vehicle.maxLoadCapacity) || 0,
      acquisitionCost: Number(vehicle.acquisitionCost) || 0,
      status: vehicle.status || 'Available'
    };

    setVehicles((prev) => [...prev, newVehicle]);
    return { success: true, vehicle: newVehicle };
  };

  const updateVehicle = (id, updatedFields) => {
    if (updatedFields.registrationNumber) {
      const exists = vehicles.some(
        (v) => v.id !== id && v.registrationNumber.toUpperCase() === updatedFields.registrationNumber.toUpperCase()
      );
      if (exists) {
        return { success: false, error: 'Vehicle Registration Number must be unique' };
      }
    }

    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updatedFields } : v))
    );
    return { success: true };
  };

  // ----------------------------------------------------
  // DRIVER CRUD
  // ----------------------------------------------------
  const addDriver = (driver) => {
    const newDriver = {
      ...driver,
      id: 'd_' + Date.now(),
      safetyScore: Number(driver.safetyScore) || 100,
      status: driver.status || 'Available'
    };

    setDrivers((prev) => [...prev, newDriver]);
    return { success: true, driver: newDriver };
  };

  const updateDriver = (id, updatedFields) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updatedFields } : d))
    );
    return { success: true };
  };

  // ----------------------------------------------------
  // TRIP LIFE CYCLE WITH BUSINESS RULES
  // ----------------------------------------------------
  const createTrip = (tripData) => {
    const vehicle = vehicles.find((v) => v.id === tripData.vehicleId);
    const driver = drivers.find((d) => d.id === tripData.driverId);

    // Business Rule: Retired or In Shop vehicle selection block
    if (!vehicle || vehicle.status === 'Retired' || vehicle.status === 'In Shop') {
      return { success: false, error: 'Selected vehicle is retired or undergoing maintenance' };
    }

    // Business Rule: Expired license or Suspended driver block
    if (!driver || driver.status === 'Suspended') {
      return { success: false, error: 'Driver profile is currently suspended' };
    }
    const today = new Date();
    const expiry = new Date(driver.licenseExpiryDate);
    if (expiry < today) {
      return { success: false, error: `Driver has an expired license (Expired: ${driver.licenseExpiryDate})` };
    }

    // Business Rule: Vehicle or Driver already On Trip blocked
    if (vehicle.status === 'On Trip') {
      return { success: false, error: 'Selected vehicle is currently assigned to another active trip' };
    }
    if (driver.status === 'On Trip') {
      return { success: false, error: 'Selected driver is currently on another active trip' };
    }

    // Business Rule: Cargo weight capacity check
    if (Number(tripData.cargoWeight) > vehicle.maxLoadCapacity) {
      return {
        success: false,
        error: `Cargo weight (${tripData.cargoWeight}kg) exceeds vehicle capacity (${vehicle.maxLoadCapacity}kg)`
      };
    }

    const newTrip = {
      ...tripData,
      id: 't_' + Date.now(),
      cargoWeight: Number(tripData.cargoWeight),
      plannedDistance: Number(tripData.plannedDistance),
      status: 'Draft',
      createdAt: new Date().toISOString()
    };

    setTrips((prev) => [...prev, newTrip]);
    return { success: true, trip: newTrip };
  };

  const dispatchTrip = (tripId) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return { success: false, error: 'Trip not found' };

    const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
    const driver = drivers.find((d) => d.id === trip.driverId);

    // Check again before actual dispatch
    if (vehicle.status !== 'Available') {
      return { success: false, error: `Vehicle is currently ${vehicle.status}` };
    }
    if (driver.status !== 'Available') {
      return { success: false, error: `Driver is currently ${driver.status}` };
    }

    // Update statuses atomically
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: 'Dispatched', dispatchedAt: new Date().toISOString() } : t))
    );
    setVehicles((prev) =>
      prev.map((v) => (v.id === trip.vehicleId ? { ...v, status: 'On Trip' } : v))
    );
    setDrivers((prev) =>
      prev.map((d) => (d.id === trip.driverId ? { ...d, status: 'On Trip' } : d))
    );

    return { success: true };
  };

  const completeTrip = (tripId, actualDistance, fuelConsumed) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return { success: false, error: 'Trip not found' };

    const parsedDist = Number(actualDistance) || trip.plannedDistance;
    const parsedFuel = Number(fuelConsumed) || 0;

    // Record Fuel Log if fuel was logged
    if (parsedFuel > 0) {
      const fuelCost = parsedFuel * 2.1; // Simulated price per liter
      const newFuelLog = {
        id: 'f_' + Date.now(),
        vehicleId: trip.vehicleId,
        tripId: tripId,
        liters: parsedFuel,
        cost: fuelCost,
        date: new Date().toISOString().split('T')[0]
      };
      setFuelLogs((prev) => [...prev, newFuelLog]);
      
      // Auto register expense
      const fuelExpense = {
        id: 'e_' + Date.now(),
        vehicleId: trip.vehicleId,
        type: 'Other',
        amount: fuelCost,
        date: new Date().toISOString().split('T')[0],
        description: `Fuel Expense for Completed Trip ${tripId}`
      };
      setExpenses((prev) => [...prev, fuelExpense]);
    }

    // Complete the trip, restore vehicle & driver to Available, cascade odometer
    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId
          ? {
              ...t,
              status: 'Completed',
              actualDistance: parsedDist,
              fuelConsumed: parsedFuel,
              completedAt: new Date().toISOString()
            }
          : t
      )
    );

    setVehicles((prev) =>
      prev.map((v) =>
        v.id === trip.vehicleId
          ? { ...v, odometer: v.odometer + parsedDist, status: 'Available' }
          : v
      )
    );

    setDrivers((prev) =>
      prev.map((d) => (d.id === trip.driverId ? { ...d, status: 'Available' } : d))
    );

    return { success: true };
  };

  const cancelTrip = (tripId) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return { success: false, error: 'Trip not found' };

    // Reset statuses back to Available if it was Dispatched
    if (trip.status === 'Dispatched') {
      setVehicles((prev) =>
        prev.map((v) => (v.id === trip.vehicleId ? { ...v, status: 'Available' } : v))
      );
      setDrivers((prev) =>
        prev.map((d) => (d.id === trip.driverId ? { ...d, status: 'Available' } : d))
      );
    }

    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: 'Cancelled' } : t))
    );

    return { success: true };
  };

  // ----------------------------------------------------
  // MAINTENANCE LOGS
  // ----------------------------------------------------
  const addMaintenanceLog = (logData) => {
    const newLog = {
      ...logData,
      id: 'm_' + Date.now(),
      cost: Number(logData.cost) || 0,
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    setMaintenanceLogs((prev) => [...prev, newLog]);

    // Cascade vehicle status to In Shop
    setVehicles((prev) =>
      prev.map((v) => (v.id === logData.vehicleId ? { ...v, status: 'In Shop' } : v))
    );

    return { success: true, log: newLog };
  };

  const closeMaintenanceLog = (logId, finalCost) => {
    const log = maintenanceLogs.find((m) => m.id === logId);
    if (!log) return { success: false, error: 'Maintenance log not found' };

    const costNum = Number(finalCost) || log.cost;

    setMaintenanceLogs((prev) =>
      prev.map((m) => (m.id === logId ? { ...m, cost: costNum, status: 'Closed', closedAt: new Date().toISOString() } : m))
    );

    // Record Maintenance Expense
    if (costNum > 0) {
      const maintExpense = {
        id: 'e_' + Date.now(),
        vehicleId: log.vehicleId,
        type: 'Other',
        amount: costNum,
        date: new Date().toISOString().split('T')[0],
        description: `Maintenance Log Cost: ${log.issueDescription}`
      };
      setExpenses((prev) => [...prev, maintExpense]);
    }

    // Restore vehicle to Available, unless Retired
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === log.vehicleId) {
          return { ...v, status: v.status === 'Retired' ? 'Retired' : 'Available' };
        }
        return v;
      })
    );

    return { success: true };
  };

  // ----------------------------------------------------
  // FUEL LOGS AND EXPENSES
  // ----------------------------------------------------
  const addFuelLog = (log) => {
    const newLog = {
      ...log,
      id: 'f_' + Date.now(),
      liters: Number(log.liters),
      cost: Number(log.cost)
    };

    setFuelLogs((prev) => [...prev, newLog]);

    // Also auto-add to expenses
    const newExpense = {
      id: 'e_' + Date.now(),
      vehicleId: log.vehicleId,
      type: 'Other',
      amount: Number(log.cost),
      date: log.date,
      description: `Fuel Log: ${log.liters} liters`
    };
    setExpenses((prev) => [...prev, newExpense]);

    return { success: true, log: newLog };
  };

  const addExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: 'e_' + Date.now(),
      amount: Number(expense.amount)
    };

    setExpenses((prev) => [...prev, newExpense]);
    return { success: true, expense: newExpense };
  };

  return (
    <MockDataContext.Provider
      value={{
        vehicles,
        drivers,
        trips,
        maintenanceLogs,
        fuelLogs,
        expenses,
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
        addExpense
      }}
    >
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const context = useContext(MockDataContext);
  if (!context) {
    throw new Error('useMockData must be used within a MockDataProvider');
  }
  return context;
}
