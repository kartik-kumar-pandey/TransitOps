import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export async function getKPIs(_req: Request, res: Response) {
  try {
    const totalVehicles = await prisma.vehicle.count();
    const inShopVehicles = await prisma.vehicle.count({ where: { status: 'In Shop' } });
    const availableVehicles = await prisma.vehicle.count({ where: { status: 'Available' } });

    const totalDrivers = await prisma.driver.count();
    const availableDrivers = await prisma.driver.count({ where: { status: 'Available' } });

    const activeTrips = await prisma.trip.count({
      where: { status: 'Dispatched' },
    });

    const openMaintenanceCount = await prisma.maintenanceLog.count({
      where: { status: 'Open' },
    });

    const fuelCostSum = await prisma.fuelLog.aggregate({
      _sum: { cost: true },
    });

    const expenseCostSum = await prisma.expense.aggregate({
      _sum: { amount: true },
    });

    const maintenanceCostSum = await prisma.maintenanceLog.aggregate({
      _sum: { cost: true },
    });

    const totalOperationalCost = 
      (fuelCostSum._sum.cost || 0) + 
      (expenseCostSum._sum.amount || 0) + 
      (maintenanceCostSum._sum.cost || 0);

    res.status(200).json({
      fleet: {
        total: totalVehicles,
        available: availableVehicles,
        inShop: inShopVehicles,
      },
      drivers: {
        total: totalDrivers,
        available: availableDrivers,
      },
      activeTrips,
      openMaintenanceCount,
      totalOperationalCost,
    });
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}
