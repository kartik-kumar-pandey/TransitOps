import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export async function getVehicles(req: Request, res: Response) {
  try {
    const { status, type, region } = req.query;

    const filter: any = {};
    if (status) filter.status = String(status);
    if (type) filter.type = String(type);
    if (region) filter.region = String(region);

    const vehicles = await prisma.vehicle.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(vehicles);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}

export async function createVehicle(req: Request, res: Response) {
  try {
    const { registrationNumber, make, model, type, region, odometer, acquisitionCost, year, capacityWeight, status } = req.body;

    if (!registrationNumber || !make || !model || !year || capacityWeight === undefined) {
      res.status(400).json({ error: 'All fields (registrationNumber, make, model, year, capacityWeight) are required' });
      return;
    }

    const existingVehicle = await prisma.vehicle.findUnique({ where: { registrationNumber } });
    if (existingVehicle) {
      res.status(400).json({ error: 'Vehicle with this registration number already exists' });
      return;
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        registrationNumber,
        make,
        model,
        type: type || 'Truck',
        region: region || 'North',
        odometer: odometer !== undefined ? parseFloat(odometer) : 0.0,
        acquisitionCost: acquisitionCost !== undefined ? parseFloat(acquisitionCost) : 0.0,
        year: parseInt(year),
        capacityWeight: parseFloat(capacityWeight),
        status: status || 'Available',
      },
    });

    res.status(201).json(vehicle);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}

export async function updateVehicle(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { registrationNumber, make, model, type, region, odometer, acquisitionCost, year, capacityWeight, status } = req.body;

    // Check if vehicle exists
    const vehicleExists = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicleExists) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }

    // Check unique registrationNumber if updated
    if (registrationNumber && registrationNumber !== vehicleExists.registrationNumber) {
      const existingVehicle = await prisma.vehicle.findUnique({ where: { registrationNumber } });
      if (existingVehicle) {
        res.status(400).json({ error: 'Vehicle with this registration number already exists' });
        return;
      }
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        registrationNumber,
        make,
        model,
        type,
        region,
        odometer: odometer !== undefined ? parseFloat(odometer) : undefined,
        acquisitionCost: acquisitionCost !== undefined ? parseFloat(acquisitionCost) : undefined,
        year: year ? parseInt(year) : undefined,
        capacityWeight: capacityWeight !== undefined ? parseFloat(capacityWeight) : undefined,
        status,
      },
    });

    res.status(200).json(updatedVehicle);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}
