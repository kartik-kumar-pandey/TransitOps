import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import vehiclesRouter from './routes/vehicles';
import driversRouter from './routes/drivers';
import tripsRouter from './routes/trips';
import operationsRouter from './routes/operations';
import dashboardRouter from './routes/dashboard';
import reportsRouter from './routes/reports';
import aiRouter from './routes/ai';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRouter);
app.use('/vehicles', vehiclesRouter);
app.use('/drivers', driversRouter);
app.use('/trips', tripsRouter);
app.use('/', operationsRouter);
app.use('/dashboard', dashboardRouter);
app.use('/reports', reportsRouter);
app.use('/ai', aiRouter);

// Basic health check route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Centralized error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
});

export default app;
