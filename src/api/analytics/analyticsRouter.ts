import { Router } from "express";
import { verifyUser } from "../../middleware/verify";
import { getAnalytics, getCategoryDistribution } from "./analyticsController";

const router = Router();

router.get('/analytics', verifyUser,getAnalytics);
router.get('/category-distribution',verifyUser,getCategoryDistribution);


export default router;
