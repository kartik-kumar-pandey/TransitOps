import { Router } from 'express';
import { getVehicles, createVehicle, updateVehicle } from '../controllers/vehicles';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getVehicles);
router.post('/', authenticateToken, createVehicle);
router.patch('/:id', authenticateToken, updateVehicle);

export default router;
