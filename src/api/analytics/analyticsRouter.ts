import { Router } from "express";
import { verifyUser } from "../../middleware/verify";
import { averageDaily, topCategory, totalSpending, topTransaction } from "./analyticsController";

const router = Router();

router.get('/analytics/total-spending/:timeRange', verifyUser, totalSpending);
router.get('/analytics/average-daily/:timeRange', verifyUser, averageDaily);
router.get('/analytics/top-category/:timeRange', verifyUser, topCategory);
router.get('/analytics/top-transaction/:timeRange', verifyUser, topTransaction);

export default router;
