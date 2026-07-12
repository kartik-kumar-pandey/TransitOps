import { Router } from 'express';
import { login, signup, forgotPassword, resetPassword } from '../controllers/auth';

const router = Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
