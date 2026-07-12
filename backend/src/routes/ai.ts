import { Router } from 'express';
import { getDispatchSuggestions, getFleetInsights, getLicenseRiskSummary, getCostForecast } from '../controllers/ai';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/dispatch-suggest', authenticateToken, getDispatchSuggestions);
router.post('/fleet-insights', authenticateToken, getFleetInsights);
router.post('/cost-forecast', authenticateToken, getCostForecast);
router.get('/license-risk', authenticateToken, getLicenseRiskSummary);

export default router;
