import { Router } from 'express';
import { login, signup } from '../controllers/auth';

import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/signup', authenticateToken, signup);

export default router;
