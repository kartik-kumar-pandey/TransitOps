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

  // 2. Seed Users
  const hashedPassword = await bcrypt.hash('password123', 10);
  const manager = await prisma.user.create({
    data: {
      email: 'manager@transitops.com',
      password: hashedPassword,
      name: 'Sarah Connor',
      role: 'fleet_manager',
    },
  });
  console.log(`Created user: ${manager.email}`);

  // 3. Seed Vehicles
  const v1 = await prisma.vehicle.create({
    data: { registrationNumber: 'TRUCK-01', make: 'Volvo', model: 'FH16', type: 'Heavy Truck', region: 'North', odometer: 45200.0, acquisitionCost: 120000.0, year: 2022, capacityWeight: 20.0, status: 'Available' },
  });
  const v2 = await prisma.vehicle.create({
    data: { registrationNumber: 'TRUCK-02', make: 'Scania', model: 'R500', type: 'Heavy Truck', region: 'South', odometer: 51230.0, acquisitionCost: 135000.0, year: 2021, capacityWeight: 25.0, status: 'Available' },
  });
  const v3 = await prisma.vehicle.create({
    data: { registrationNumber: 'VAN-03', make: 'Mercedes-Benz', model: 'Sprinter', type: 'Light Van', region: 'East', odometer: 12300.0, acquisitionCost: 45000.0, year: 2023, capacityWeight: 3.5, status: 'Available' },
  });
  const v4 = await prisma.vehicle.create({
    data: { registrationNumber: 'TRUCK-04', make: 'MAN', model: 'TGX', type: 'Heavy Truck', region: 'West', odometer: 89000.0, acquisitionCost: 98000.0, year: 2020, capacityWeight: 18.0, status: 'In Shop' },
  });
  await prisma.vehicle.create({
    data: { registrationNumber: 'VAN-05', make: 'Ford', model: 'Transit', type: 'Light Van', region: 'North', odometer: 24000.0, acquisitionCost: 38000.0, year: 2022, capacityWeight: 5.0, status: 'Available' },
  });
  console.log('Seed vehicles successfully.');

  // 4. Seed Drivers
  await prisma.driver.create({
    data: { name: 'Alex Mercer', licenseNumber: 'DL-98231', licenseExpiry: new Date('2028-12-31'), status: 'Available', safetyScore: 98.5 },
  });
  await prisma.driver.create({
    data: { name: 'Priya Sharma', licenseNumber: 'DL-12837', licenseExpiry: new Date('2029-06-15'), status: 'Available', safetyScore: 92.0 },
  });
  await prisma.driver.create({
    data: { name: 'Raj Patel', licenseNumber: 'DL-77321', licenseExpiry: new Date('2026-07-20'), status: 'Available', safetyScore: 88.0 }, // Expires soon
  });
  await prisma.driver.create({
    data: { name: 'John Doe', licenseNumber: 'DL-00123', licenseExpiry: new Date('2025-01-01'), status: 'Available', safetyScore: 75.0 }, // Expired
  });
  console.log('Seed drivers successfully.');

  // 5. Seed Logs (Fuel & Maintenance & Expense)
  // Maintenance logs for TRUCK-04 (In Shop)
  await prisma.maintenanceLog.create({
    data: { vehicleId: v4.id, description: 'Engine overhaul & sensor repair', cost: 1250.00, status: 'Open' },
  });

  // Fuel logs for TRUCK-01 and TRUCK-02
  await prisma.fuelLog.create({
    data: { vehicleId: v1.id, fuelAmount: 150.0, cost: 320.00, odometerReading: 45200.0 },
  });
  await prisma.fuelLog.create({
    data: { vehicleId: v2.id, fuelAmount: 180.0, cost: 385.50, odometerReading: 51230.0 },
  });

  // Expenses
  await prisma.expense.create({
    data: { vehicleId: v1.id, description: 'State Highway Toll Gate Pass', amount: 45.00, category: 'Toll' },
  });
  await prisma.expense.create({
    data: { vehicleId: v3.id, description: 'Interstate Freight Permit', amount: 120.00, category: 'Permit' },
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
