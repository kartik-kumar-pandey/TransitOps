# 🚛 TransitOps – Smart Transport Operations Platform

TransitOps is a full-stack fleet management platform built to digitize transport operations by managing vehicles, drivers, trips, maintenance, fuel logs, expenses, and analytics. It enforces business rules, provides operational insights, and streamlines fleet management through a centralized dashboard.

> Built for an 8-hour hackathon using **React**, **Node.js**, **Express**, **PostgreSQL**, and **OpenAI/Claude API** for AI-powered insights.

---

## 📌 Features

### 🔐 Authentication & Role-Based Access Control (RBAC)
- Secure login and signup
- JWT Authentication
- Role-based authorization
- Roles:
  - Fleet Manager
  - Driver
  - Safety Officer
  - Financial Analyst

---

### 🚛 Vehicle Management
- Register and manage vehicles
- Update vehicle details
- Track vehicle status
- Vehicle search and filters

Vehicle Status:
- Available
- On Trip
- In Shop
- Retired

---

### 👨‍✈️ Driver Management
- Driver registration
- License tracking
- Safety score management
- Driver availability status

Driver Status:
- Available
- On Trip
- Off Duty
- Suspended

---

### 📦 Trip Management
Create and manage transport trips.

Trip Lifecycle:

Draft
→ Dispatched
→ Completed
→ Cancelled

Features:
- Assign vehicle and driver
- Cargo validation
- Distance tracking
- Fuel consumption logging
- Automatic status updates

---

### 🔧 Maintenance Management
- Create maintenance records
- Vehicle automatically moved to **In Shop**
- Close maintenance
- Vehicle restored to **Available**

---

### ⛽ Fuel & Expense Tracking
- Fuel logs
- Toll expenses
- Maintenance expenses
- Operational cost calculation

---

### 📊 Dashboard
Real-time KPIs including:

- Active Vehicles
- Available Vehicles
- Vehicles in Maintenance
- Active Trips
- Pending Trips
- Drivers On Duty
- Fleet Utilization

---

### 📈 Reports & Analytics
- Fuel Efficiency
- Operational Cost
- Fleet Utilization
- Vehicle ROI
- CSV Export

---

### 🤖 AI Features
#### AI Dispatch Advisor
Recommends the most suitable vehicle and driver based on:
- Cargo weight
- Vehicle capacity
- Driver availability
- Safety score

#### AI Fleet Insights
Natural language analytics such as:

> "Which vehicle incurred the highest maintenance cost this month?"

---

## 🛠 Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Recharts

### Backend
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcrypt

### AI
- OpenAI API / Claude API

---

## 📂 Project Structure

```
TransitOps/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── prisma/
│   ├── utils/
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── App.jsx
│
├── README.md
└── package.json
```

---

## 🗄 Database Schema

- Users
- Vehicles
- Drivers
- Trips
- Maintenance Logs
- Fuel Logs
- Expenses

Relationships:

```
Vehicle
   ├── Trips
   ├── Maintenance Logs
   ├── Fuel Logs
   └── Expenses

Driver
   └── Trips
```

---

## 🚦 Business Rules

- Vehicle registration number must be unique.
- Retired or In Shop vehicles cannot be dispatched.
- Suspended or expired-license drivers cannot be assigned.
- Vehicle or driver already on a trip cannot be reused.
- Cargo weight cannot exceed vehicle capacity.
- Dispatch automatically changes vehicle and driver status to **On Trip**.
- Completing a trip restores both to **Available**.
- Maintenance automatically moves vehicle to **In Shop**.
- Closing maintenance restores vehicle to **Available** (unless retired).

---

## 📡 REST API

### Authentication

```
POST /auth/signup
POST /auth/login
```

### Vehicles

```
GET    /vehicles
POST   /vehicles
PATCH  /vehicles/:id
DELETE /vehicles/:id
```

### Drivers

```
GET    /drivers
POST   /drivers
PATCH  /drivers/:id
DELETE /drivers/:id
```

### Trips

```
GET    /trips
POST   /trips
PATCH  /trips/:id/dispatch
PATCH  /trips/:id/complete
PATCH  /trips/:id/cancel
```

### Maintenance

```
POST  /maintenance
PATCH /maintenance/:id/close
```

### Fuel & Expenses

```
POST /fuel-logs
POST /expenses
```

### Reports

```
GET /dashboard/kpis
GET /reports/fuel-efficiency
GET /reports/utilization
GET /reports/cost
GET /reports/roi
GET /reports/export?format=csv
```

---

## ⚙ Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/transitops.git
cd transitops
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

Backend `.env`

```env
PORT=5000

DATABASE_URL=postgresql://username:password@localhost:5432/transitops

JWT_SECRET=your_jwt_secret

OPENAI_API_KEY=your_api_key
```

---

## 📸 Screens

- Login
- Dashboard
- Vehicle Registry
- Driver Management
- Trip Management
- Maintenance
- Fuel & Expenses
- Reports & Analytics

---



## 📄 License

This project is developed for educational and hackathon purposes.
