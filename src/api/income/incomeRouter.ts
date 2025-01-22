import { Router } from "express";
import { createIncome, getIncome } from "./incomeController";
import { verifyUser } from "../../middleware/verify";

const router=Router();
router.post('/create-income',verifyUser,createIncome);
router.get('/get-income',verifyUser,getIncome);
router.put('/update-income',verifyUser,getIncome);

export default router;