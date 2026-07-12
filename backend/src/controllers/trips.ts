import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export async function getTrips(_req: Request, res: Response) {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        vehicle: true,
        driver: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(trips);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}

export async function createTrip(req: Request, res: Response) {
  try {
    const { tripNumber, vehicleId, driverId, origin, destination, cargoWeight } = req.body;

    if (!tripNumber || !vehicleId || !driverId || !origin || !destination || cargoWeight === undefined) {
      res.status(400).json({ error: 'All fields (tripNumber, vehicleId, driverId, origin, destination, cargoWeight) are required' });
      return;
    }

    // Ensure tripNumber is unique
    const existingTrip = await prisma.trip.findUnique({ where: { tripNumber } });
    if (existingTrip) {
      res.status(400).json({ error: 'Trip number already exists' });
      return;
    }

    // Check vehicle existence
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }

    // Check cargo weight validation
    if (parseFloat(cargoWeight) > vehicle.capacityWeight) {
      res.status(400).json({ error: `Cargo weight exceeds vehicle weight capacity of ${vehicle.capacityWeight} tons` });
      return;
    }

    // Check driver existence
    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) {
      res.status(404).json({ error: 'Driver not found' });
      return;
    }

    // License must be valid (not expired)
    const today = new Date();
    if (new Date(driver.licenseExpiry) < today) {
      res.status(400).json({ error: 'Driver license has expired' });
      return;
    }

    // Created as "Draft" initially
    const trip = await prisma.trip.create({
      data: {
        tripNumber,
        vehicleId,
        driverId,
        origin,
        destination,
        cargoWeight: parseFloat(cargoWeight),
        status: 'Draft',
      },
    });

    res.status(201).json(trip);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}

export async function dispatchTrip(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { vehicle: true, driver: true },
    });

    if (!trip) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }

    // Allows dispatching from Draft or Scheduled
    if (trip.status !== 'Draft' && trip.status !== 'Scheduled') {
      res.status(400).json({ error: `Cannot dispatch trip in ${trip.status} status` });
      return;
    }

    if (trip.vehicle.status !== 'Available') {
      res.status(400).json({ error: `Assigned vehicle status is ${trip.vehicle.status}, must be Available` });
      return;
    }

    if (trip.driver.status !== 'Available') {
      res.status(400).json({ error: `Assigned driver status is ${trip.driver.status}, must be Available` });
      return;
    }

    // Update statuses using transaction
    const [updatedTrip] = await prisma.$transaction([
      prisma.trip.update({
        where: { id },
        data: { status: 'Dispatched', dispatchedAt: new Date() },
      }),
      prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'On Trip' },
      }),
      prisma.driver.update({
        where: { id: trip.driverId },
        data: { status: 'On Trip' },
      }),
    ]);

    res.status(200).json(updatedTrip);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}

export async function completeTrip(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { odometer, fuelAmount, fuelCost } = req.body;

    if (odometer === undefined) {
      res.status(400).json({ error: 'Odometer reading is required to complete the trip' });
      return;
    }

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }

    if (trip.status !== 'Dispatched') {
      res.status(400).json({ error: `Cannot complete trip in ${trip.status} status` });
      return;
    }

    const nextOdometer = parseFloat(odometer);

    // Cascades & Transactions: Update trip status, vehicle odometer + availability, driver availability, and create fuel logs if provided
    const dbOperations: any[] = [
      prisma.trip.update({
        where: { id },
        data: { status: 'Completed', completedAt: new Date() },
      }),
      prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'Available', odometer: nextOdometer },
      }),
      prisma.driver.update({
        where: { id: trip.driverId },
        data: { status: 'Available' },
      }),
    ];

    if (fuelAmount !== undefined && fuelCost !== undefined) {
      dbOperations.push(
        prisma.fuelLog.create({
          data: {
            vehicleId: trip.vehicleId,
            fuelAmount: parseFloat(fuelAmount),
            cost: parseFloat(fuelCost),
            odometerReading: nextOdometer,
          },
        })
      );
    }

    const [updatedTrip] = await prisma.$transaction(dbOperations);

    res.status(200).json(updatedTrip);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}

export async function cancelTrip(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }

    const previousStatus = trip.status;

    // Transaction updates: If previous status was Dispatched, restore vehicle and driver to Available
    const updates: any[] = [
      prisma.trip.update({
        where: { id },
        data: { status: 'Cancelled' },
      }),
    ];

    if (previousStatus === 'Dispatched') {
      updates.push(
        prisma.vehicle.update({
          where: { id: trip.vehicleId },
          data: { status: 'Available' },
        }),
        prisma.driver.update({
          where: { id: trip.driverId },
          data: { status: 'Available' },
        })
      );
    }

    const [updatedTrip] = await prisma.$transaction(updates);

    res.status(200).json(updatedTrip);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}
