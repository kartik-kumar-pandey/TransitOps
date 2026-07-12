import { Router } from 'express';
import {
  getMaintenanceLogs,
  createMaintenanceLog,
  closeMaintenanceLog,
  getFuelLogs,
  createFuelLog,
  getExpenses,
  createExpense,
} from '../controllers/operations';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Maintenance Logs
router.get('/maintenance', authenticateToken, getMaintenanceLogs);
router.post('/maintenance', authenticateToken, createMaintenanceLog);
router.patch('/maintenance/:id/close', authenticateToken, closeMaintenanceLog);

// Fuel Logs
router.get('/fuel-logs', authenticateToken, getFuelLogs);
router.post('/fuel-logs', authenticateToken, createFuelLog);

// Expenses
router.get('/expenses', authenticateToken, getExpenses);
router.post('/expenses', authenticateToken, createExpense);

export default router;
