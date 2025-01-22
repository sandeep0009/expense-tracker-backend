import { Router } from "express";
import userRouter from "../api/user/userRouter";
import incomeRouter from "../api/income/incomeRouter";
import expenseRouter from "../api/expense/expenseRouter";
import analyticRouter from "../api/analytics/analyticsRouter";

const router=Router();

router.use(userRouter);
router.use(incomeRouter);
router.use(expenseRouter);
router.use(analyticRouter);

export default router