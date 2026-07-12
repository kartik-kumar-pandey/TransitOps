import { Router } from 'express';
import { getTrips, createTrip, dispatchTrip, completeTrip, cancelTrip } from '../controllers/trips';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getTrips);
router.post('/', authenticateToken, createTrip);
router.patch('/:id/dispatch', authenticateToken, dispatchTrip);
router.patch('/:id/complete', authenticateToken, completeTrip);
router.patch('/:id/cancel', authenticateToken, cancelTrip);

export default router;
