import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export async function getDrivers(req: Request, res: Response) {
  try {
    const { status } = req.query;

    const filter: any = {};
    if (status) filter.status = String(status);

    const drivers = await prisma.driver.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(drivers);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}

export async function createDriver(req: Request, res: Response) {
  try {
    const { name, licenseNumber, licenseExpiry, status, safetyScore } = req.body;

    if (!name || !licenseNumber || !licenseExpiry) {
      res.status(400).json({ error: 'Name, licenseNumber, and licenseExpiry are required' });
      return;
    }

    const existingDriver = await prisma.driver.findUnique({ where: { licenseNumber } });
    if (existingDriver) {
      res.status(400).json({ error: 'Driver with this license number already exists' });
      return;
    }

    const driver = await prisma.driver.create({
      data: {
        name,
        licenseNumber,
        licenseExpiry: new Date(licenseExpiry),
        status: status || 'Available',
        safetyScore: safetyScore !== undefined ? parseFloat(safetyScore) : 100.0,
      },
    });

    res.status(201).json(driver);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}

export async function updateDriver(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, licenseNumber, licenseExpiry, status, safetyScore } = req.body;

    // Check if driver exists
    const driverExists = await prisma.driver.findUnique({ where: { id } });
    if (!driverExists) {
      res.status(404).json({ error: 'Driver not found' });
      return;
    }

    // Check unique licenseNumber if updated
    if (licenseNumber && licenseNumber !== driverExists.licenseNumber) {
      const existingDriver = await prisma.driver.findUnique({ where: { licenseNumber } });
      if (existingDriver) {
        res.status(400).json({ error: 'Driver with this license number already exists' });
        return;
      }
    }

    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: {
        name,
        licenseNumber,
        licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : undefined,
        status,
        safetyScore: safetyScore !== undefined ? parseFloat(safetyScore) : undefined,
      },
    });

    res.status(200).json(updatedDriver);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}
