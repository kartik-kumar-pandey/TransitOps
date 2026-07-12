# Backend Implementation Plan

## Stack

- Node.js
- Express
- PostgreSQL
- Prisma
- JWT
- bcrypt

---

## Database

Tables

- Users
- Vehicles
- Drivers
- Trips
- Maintenance Logs
- Fuel Logs
- Expenses

---

## APIs

### Authentication

POST /auth/login

POST /auth/signup

---

### Vehicles

GET /vehicles

POST /vehicles

PATCH /vehicles/:id

---

### Drivers

GET /drivers

POST /drivers

PATCH /drivers/:id

---

### Trips

GET /trips

POST /trips

PATCH /trips/:id/dispatch

PATCH /trips/:id/complete

PATCH /trips/:id/cancel

---

### Maintenance

POST /maintenance

PATCH /maintenance/:id/close

---

### Fuel

POST /fuel-logs

---

### Expenses

POST /expenses

---

### Reports

GET /dashboard/kpis

GET /reports/fuel-efficiency

GET /reports/utilization

GET /reports/cost

GET /reports/roi

GET /reports/export

---

### AI

POST /ai/dispatch-suggest

POST /ai/cost-forecast

GET /ai/fleet-insights

---

## Business Rules

- Registration number must be unique
- Vehicle must be Available
- Driver must be Available
- License must be valid
- Cargo weight validation
- Dispatch updates Vehicle + Driver
- Complete restores Vehicle + Driver
- Cancel restores Vehicle + Driver
- Maintenance changes vehicle to In Shop
- Close Maintenance restores Available

---

## Folder Structure

src/
├── ai/
├── controllers/
├── middleware/
├── prisma/
├── routes/
├── services/
├── utils/
└── validators/
