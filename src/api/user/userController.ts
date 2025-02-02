import { Request ,Response} from "express";
import { userMessage } from "../../constant/constant"
import { client } from "../../helper/prismaClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_KEY } from "../../config/config";
import { userLoginValidation, userSchemaVaildation } from "../../helper/zodValidation";
import crypto from "crypto";
import { transport } from "../../helper/nodeMailer";
export const signup=async(
    req:Request,
    res:Response
):Promise<any>=>{
    try { 
        const {name,email,password,imageUrl}=req.body;
        const vaildCheck = userSchemaVaildation.safeParse(req.body);
        if(!vaildCheck.success){
            res.status(404).json({message:"please provide valid data input"});
            return;
        }
        const userExist=await client.user.findFirst({where:{email}});
        if(userExist){
            res.status(401).json({message:userMessage.userExist});
            return;
        }
        const hashPassword=await bcrypt.hash(password,10);
        const newUser=await client.user.create({
            data:{
                name,
                email,               
                password:hashPassword,
                imageUrl
            }
        });
        const token=jwt.sign({
            userId:newUser.id
        },JWT_KEY,{expiresIn:"1hr"});
        res.status(201).json({message:userMessage.created,token});        
    } catch (error) {
        console.log(error)
        return res.status(404).json({message:userMessage.error});       
    }
}
export const signin= async(
    req:Request,
    res:Response
):Promise<any>=>{
    try {      
        const {email,password}=req.body;
        const vaildCheck=userLoginValidation.safeParse(req.body);
        if(!vaildCheck.success){
            res.status(404).json({message:"please provide valid data input"});
            return;
        }
        const userExist=await client.user.findFirst({where:{email}});
        if(!userExist){
            res.status(404).json({message:userMessage.credentialError});
            return;
        }
        if(userExist?.password===undefined || userExist?.password==null){
            return
        }
        const comparePassword=await bcrypt.compare(password,userExist.password);
        if(!comparePassword){
            res.status(404).json({message:userMessage.credentialError});
            return;
        }
        const otp=crypto.randomInt(100000, 999999).toString();
        const ok=await client.user.update({
            where:{email},
            data:{
                otp,
                otpExpiry:new Date(Date.now()+5*60*1000)
            }

        });
        try {
            const l= await transport.sendMail({
                from:process.env.EMAIL_USER,
                to:email,
                subject:"Pocket pilot verification code",
                text:`Your OTP code is ${otp}.It will expiry in 5 minutes.`
            })
            
        } catch (error) {
            console.log(error)
            
        }
        const token=jwt.sign({
            userId:userExist.id
        },JWT_KEY,{expiresIn:"1hr"});
      
  
        res.status(200).json({message:userMessage.logged,token});
        
    } catch (error) {
        return res.status(404).json({message:userMessage.error});        
    }
}
export const verifyOtp=async(req:Request,res:Response):Promise<any>=>{
    try {
        const {email,otp}=req.body;
        const userExist=await client.user.findFirst({where:{email:email}});
        if(!userExist){
            res.status(404).json({message:userMessage.credentialError});
            return;
        }
        if(!userExist.otp || userExist.otp!==otp || !userExist.otpExpiry || new Date() > userExist.otpExpiry){
            res.status(404).json({message:userMessage.otp});
            return;
        }
        const token=jwt.sign({
            userId:userExist.id
        },JWT_KEY,{expiresIn:"1hr"});
        await client.user.update(
            {
                where:{email},
                data:{
                    otp:null,
                    otpExpiry:null
                }
            }
        );
        res.status(200).json({message:userMessage.otpVerify,token});
    } catch (error) {
        return res.status(404).json({message:userMessage.error});      
    }

}


export const googleAuth=async(
    req:Request,
    res:Response
):Promise<any>=>{
    try {
        
    } catch (error) {
        console.log("error",error);
        
    }
}