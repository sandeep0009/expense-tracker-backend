import { Router } from "express";
import userRouter from "../api/user/userRouter";
import incomeRouter from "../api/income/incomeRouter";

const router=Router();

router.use(userRouter);
router.use(incomeRouter);

export default router