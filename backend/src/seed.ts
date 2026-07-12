import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing database records
  await prisma.expense.deleteMany({});
  await prisma.fuelLog.deleteMany({});
  await prisma.maintenanceLog.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.driver.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Seed Users matching frontend exactly
  const hashedPassword = await bcrypt.hash('transit123', 10);
  
  await prisma.user.create({
    data: {
      email: 'fleet@transit.com',
      password: hashedPassword,
      name: 'John Fleet Manager',
      role: 'fleet_manager',
    },
  });

  await prisma.user.create({
    data: {
      email: 'driver@transit.com',
      password: hashedPassword,
      name: 'Alex Driver',
      role: 'driver',
    },
  });

  await prisma.user.create({
    data: {
      email: 'safety@transit.com',
      password: hashedPassword,
      name: 'Sarah Safety',
      role: 'safety_officer',
    },
  });

  await prisma.user.create({
    data: {
      email: 'finance@transit.com',
      password: hashedPassword,
      name: 'Frank Finance',
      role: 'financial_analyst',
    },
  });

  console.log('Created user credentials matching UI demo logins.');

  // 3. Seed Vehicles
  const v1 = await prisma.vehicle.create({
    data: { registrationNumber: 'REG-001', make: 'Ford', model: 'Transit Van-01', type: 'Van', region: 'North', odometer: 15200.0, acquisitionCost: 32000.0, year: 2022, capacityWeight: 1000.0, status: 'Available' },
  });
  const v2 = await prisma.vehicle.create({
    data: { registrationNumber: 'REG-002', make: 'Mercedes', model: 'Sprinter Van-02', type: 'Van', region: 'South', odometer: 24500.0, acquisitionCost: 38000.0, year: 2021, capacityWeight: 1200.0, status: 'Available' },
  });
  const v3 = await prisma.vehicle.create({
    data: { registrationNumber: 'REG-003', make: 'Volvo', model: 'Heavy Truck-01', type: 'Truck', region: 'East', odometer: 112000.0, acquisitionCost: 95000.0, year: 2023, capacityWeight: 8000.0, status: 'In Shop' },
  });
  await prisma.vehicle.create({
    data: { registrationNumber: 'REG-004', make: 'Isuzu', model: 'Medium Truck-02', type: 'Truck', region: 'West', odometer: 215000.0, acquisitionCost: 55000.0, year: 2020, capacityWeight: 4500.0, status: 'Retired' },
  });
  console.log('Seed vehicles successfully.');

  // 4. Seed Drivers
  const d1 = await prisma.driver.create({
    data: { name: 'Alex Smith', licenseNumber: 'DL-99211', licenseExpiry: new Date('2027-12-31'), status: 'Available', safetyScore: 92.0 },
  });
  await prisma.driver.create({
    data: { name: 'Maria Jones', licenseNumber: 'DL-38829', licenseExpiry: new Date('2026-10-15'), status: 'Available', safetyScore: 88.0 },
  });
  await prisma.driver.create({
    data: { name: 'David Miller', licenseNumber: 'DL-12290', licenseExpiry: new Date('2028-04-12'), status: 'Suspended', safetyScore: 45.0 },
  });
  await prisma.driver.create({
    data: { name: 'Sarah Connor', licenseNumber: 'DL-00219', licenseExpiry: new Date('2025-01-01'), status: 'Available', safetyScore: 95.0 },
  });
  console.log('Seed drivers successfully.');

  // 5. Seed Trips
  await prisma.trip.create({
    data: {
      tripNumber: 'TR001',
      vehicleId: v1.id,
      driverId: d1.id,
      origin: 'Chicago Hub',
      destination: 'Detroit Depot',
      cargoWeight: 800.0,
      status: 'Draft',
    },
  });

  // 6. Seed Logs (Fuel & Maintenance & Expense)
  await prisma.maintenanceLog.create({
    data: { vehicleId: v3.id, description: 'Scheduled 100k transmission service', cost: 1200.00, status: 'Active' },
  });

  await prisma.fuelLog.create({
    data: { vehicleId: v1.id, fuelAmount: 45.0, cost: 94.50, odometerReading: 15200.0 },
  });
  await prisma.fuelLog.create({
    data: { vehicleId: v2.id, fuelAmount: 50.0, cost: 110.00, odometerReading: 24500.0 },
  });

  await prisma.expense.create({
    data: { vehicleId: v1.id, description: 'I-90 Expressway Toll', amount: 15.00, category: 'Toll' },
  });
  await prisma.expense.create({
    data: { vehicleId: v3.id, description: 'Maintenance Log Cost', amount: 1200.00, category: 'Other' },
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
