import { Router } from 'express';
import { getDrivers, createDriver, updateDriver } from '../controllers/drivers';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getDrivers);
router.post('/', authenticateToken, createDriver);
router.patch('/:id', authenticateToken, updateDriver);

export default router;
