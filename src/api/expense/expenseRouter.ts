import { Router } from "express"
import { verifyUser } from "../../middleware/verify";
import { allExpense, createExpense, deleteExpense, filterQuery, getDashboard, recentTransaction, spendingOverview, updateExpense } from "./expenseController";

const router =Router();

router.post('/create-expense',verifyUser,createExpense);
router.get('/all-expense',verifyUser,allExpense);
router.get('/transactions',verifyUser,filterQuery);
router.patch('/update-expnse/:id',verifyUser,updateExpense);
router.delete('/:id',verifyUser,deleteExpense);
router.get('/dashboard',verifyUser,getDashboard);
router.get('/recent-transactions',verifyUser,recentTransaction);
router.get('/spending-overview',verifyUser,spendingOverview);
export default router;