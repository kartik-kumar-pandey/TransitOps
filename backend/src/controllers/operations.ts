import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// --- Maintenance Logs ---

export async function getMaintenanceLogs(_req: Request, res: Response) {
  try {
    const logs = await prisma.maintenanceLog.findMany({
      include: { vehicle: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(logs);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}

export async function createMaintenanceLog(req: Request, res: Response) {
  try {
    const { vehicleId, description, cost } = req.body;

    if (!vehicleId || !description || cost === undefined) {
      res.status(400).json({ error: 'vehicleId, description, and cost are required' });
      return;
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }

    // Create log and update vehicle status to "In Shop" using transaction
    const [log] = await prisma.$transaction([
      prisma.maintenanceLog.create({
        data: {
          vehicleId,
          description,
          cost: parseFloat(cost),
          status: 'Open',
        },
      }),
      prisma.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'In Shop' },
      }),
    ]);

    res.status(201).json(log);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}

export async function closeMaintenanceLog(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const log = await prisma.maintenanceLog.findUnique({ where: { id } });
    if (!log) {
      res.status(404).json({ error: 'Maintenance log not found' });
      return;
    }

    if (log.status !== 'Open') {
      res.status(400).json({ error: `Maintenance log is already ${log.status}` });
      return;
    }

    // Close log and update vehicle status back to "Available"
    const [updatedLog] = await prisma.$transaction([
      prisma.maintenanceLog.update({
        where: { id },
        data: { status: 'Closed', closedAt: new Date() },
      }),
      prisma.vehicle.update({
        where: { id: log.vehicleId },
        data: { status: 'Available' },
      }),
    ]);

    res.status(200).json(updatedLog);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}

// --- Fuel Logs ---

export async function getFuelLogs(_req: Request, res: Response) {
  try {
    const logs = await prisma.fuelLog.findMany({
      include: { vehicle: true },
      orderBy: { loggedAt: 'desc' },
    });
    res.status(200).json(logs);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}

export async function createFuelLog(req: Request, res: Response) {
  try {
    const { vehicleId, fuelAmount, cost, odometerReading } = req.body;

    if (!vehicleId || fuelAmount === undefined || cost === undefined || odometerReading === undefined) {
      res.status(400).json({ error: 'vehicleId, fuelAmount, cost, and odometerReading are required' });
      return;
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }

    const log = await prisma.fuelLog.create({
      data: {
        vehicleId,
        fuelAmount: parseFloat(fuelAmount),
        cost: parseFloat(cost),
        odometerReading: parseFloat(odometerReading),
      },
    });

    res.status(201).json(log);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}

// --- Expenses ---

export async function getExpenses(_req: Request, res: Response) {
  try {
    const expenses = await prisma.expense.findMany({
      include: { vehicle: true },
      orderBy: { loggedAt: 'desc' },
    });
    res.status(200).json(expenses);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}

export async function createExpense(req: Request, res: Response) {
  try {
    const { vehicleId, description, amount, category } = req.body;

    if (!vehicleId || !description || amount === undefined || !category) {
      res.status(400).json({ error: 'vehicleId, description, amount, and category are required' });
      return;
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }

    const expense = await prisma.expense.create({
      data: {
        vehicleId,
        description,
        amount: parseFloat(amount),
        category,
      },
    });

    res.status(201).json(expense);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}
