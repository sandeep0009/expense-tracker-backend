import { Router } from "express";
import userRouter from "../api/user/userRouter";
import incomeRouter from "../api/income/incomeRouter";
import expenseRouter from "../api/expense/expenseRouter";

const router=Router();

router.use(userRouter);
router.use(incomeRouter);
router.use(expenseRouter);

export default router