import { Router } from "express";
import { googleAuth, signin, signup, verifyOtp } from "./userController";

const router=Router();

router.post('/signup',signup);
router.post('/signin',signin);
router.post('/verify-otp',verifyOtp);


export default router;
