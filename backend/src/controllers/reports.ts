import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export async function getFuelEfficiencyReport(_req: Request, res: Response) {
  try {
    const fuelLogs = await prisma.fuelLog.findMany({
      include: { vehicle: true },
    });

    // Group by vehicle
    const efficiencyMap: { [key: string]: { make: string; model: string; reg: string; totalFuel: number; totalCost: number; logCount: number } } = {};
    
    fuelLogs.forEach(log => {
      const vId = log.vehicleId;
      if (!efficiencyMap[vId]) {
        efficiencyMap[vId] = {
          make: log.vehicle.make,
          model: log.vehicle.model,
          reg: log.vehicle.registrationNumber,
          totalFuel: 0,
          totalCost: 0,
          logCount: 0,
        };
      }
      efficiencyMap[vId].totalFuel += log.fuelAmount;
      efficiencyMap[vId].totalCost += log.cost;
      efficiencyMap[vId].logCount += 1;
    });

    const report = Object.keys(efficiencyMap).map(id => ({
      vehicleId: id,
      ...efficiencyMap[id],
      averageCostPerFuelUnit: efficiencyMap[id].totalFuel > 0 
        ? parseFloat((efficiencyMap[id].totalCost / efficiencyMap[id].totalFuel).toFixed(2))
        : 0,
    }));

    res.status(200).json(report);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}

export async function getUtilizationReport(_req: Request, res: Response) {
  try {
    const totalVehicles = await prisma.vehicle.count();
    const busyVehicles = await prisma.vehicle.count({
      where: { status: 'On Trip' },
    });
    const inShopVehicles = await prisma.vehicle.count({
      where: { status: 'In Shop' },
    });

    const utilizationPercentage = totalVehicles > 0 ? (busyVehicles / totalVehicles) * 100 : 0;

    res.status(200).json({
      totalVehicles,
      onTrip: busyVehicles,
      inShop: inShopVehicles,
      utilizationPercentage: parseFloat(utilizationPercentage.toFixed(1)),
    });
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}

export async function getCostReport(_req: Request, res: Response) {
  try {
    const fuelCostSum = await prisma.fuelLog.aggregate({
      _sum: { cost: true },
    });
    const expenseCostSum = await prisma.expense.aggregate({
      _sum: { amount: true },
    });
    const maintenanceCostSum = await prisma.maintenanceLog.aggregate({
      _sum: { cost: true },
    });

    const breakdown = [
      { category: 'Fuel', amount: fuelCostSum._sum.cost || 0 },
      { category: 'Maintenance', amount: maintenanceCostSum._sum.cost || 0 },
      { category: 'Other Expenses', amount: expenseCostSum._sum.amount || 0 },
    ];

    res.status(200).json({
      breakdown,
      total: breakdown.reduce((sum, item) => sum + item.amount, 0),
    });
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}

export async function getROIReport(_req: Request, res: Response) {
  try {
    // Basic demonstration of ROI calculation
    // Revenue could be mock-calculated by cargo weight or trips completed
    const completedTrips = await prisma.trip.findMany({
      where: { status: 'Completed' },
    });

    // Mock revenue: $250 base + $15 per ton of cargo weight
    const totalRevenue = completedTrips.reduce((sum, trip) => {
      return sum + (250 + (trip.cargoWeight * 15));
    }, 0);

    const fuelCostSum = await prisma.fuelLog.aggregate({ _sum: { cost: true } });
    const expenseCostSum = await prisma.expense.aggregate({ _sum: { amount: true } });
    const maintenanceCostSum = await prisma.maintenanceLog.aggregate({ _sum: { cost: true } });

    const totalCost = 
      (fuelCostSum._sum.cost || 0) + 
      (expenseCostSum._sum.amount || 0) + 
      (maintenanceCostSum._sum.cost || 0);

    const netProfit = totalRevenue - totalCost;
    const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

    res.status(200).json({
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOperationalCost: parseFloat(totalCost.toFixed(2)),
      netProfit: parseFloat(netProfit.toFixed(2)),
      roiPercentage: parseFloat(roi.toFixed(1)),
    });
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}

export async function exportCSVReport(req: Request, res: Response) {
  try {
    const { format } = req.query;

    if (format !== 'csv') {
      res.status(400).json({ error: 'Unsupported export format. Use ?format=csv' });
      return;
    }

    // Generate dummy CSV mock
    const csvContent = [
      'Type,Odometer,Cost,Details,Date',
      'Fuel,45210,120.50,Full tank refuel,2026-07-10',
      'Maintenance,45300,450.00,Oil change & Brake replacement,2026-07-11',
      'Expense,45300,15.00,Toll gate fee,2026-07-11',
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=fleet_report.csv');
    res.status(200).send(csvContent);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
}
