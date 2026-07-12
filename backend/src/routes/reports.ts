import { Router } from 'express';
import {
  getFuelEfficiencyReport,
  getUtilizationReport,
  getCostReport,
  getROIReport,
  exportCSVReport,
} from '../controllers/reports';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/fuel-efficiency', authenticateToken, getFuelEfficiencyReport);
router.get('/utilization', authenticateToken, getUtilizationReport);
router.get('/cost', authenticateToken, getCostReport);
router.get('/roi', authenticateToken, getROIReport);
router.get('/export', authenticateToken, exportCSVReport);

export default router;
