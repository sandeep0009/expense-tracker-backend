import { Request ,Response} from "express";
import { userMessage } from "../../constant/constant"
import { client } from "../../helper/prismaClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_KEY } from "../../config/config";
import { userLoginValidation, userSchemaVaildation } from "../../helper/zodValidation";

export const signup=async(
    req:Request,
    res:Response
):Promise<any>=>{
    try { 
        const {name,email,password,imageUrl}=req.body.formData;
        const vaildCheck=userSchemaVaildation.safeParse(req.body.formatData);
        if(!vaildCheck.success){
            res.status(404).json({message:"please provide valid data input"});
            return;

        }
        const userExist=await client.user.findUnique({where:{email:email}});
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
        res.status(201).json({message:userMessage.created,newUser});

        
    } catch (error) {
        console.log(error)
        return res.status(404).json({message:userMessage.error})
        
    }

}

export const signin= async(
    req:Request,
    res:Response
):Promise<any>=>{
    try {
        
        const {email,password}=req.body.formData;
        const vaildCheck=userLoginValidation.safeParse(req.body.formatData);
        if(!vaildCheck.success){
            res.status(404).json({message:"please provide valid data input"});
            return;
        }
        const userExist=await client.user.findUnique({where:{email:email}});
        if(!userExist){
            res.status(404).json({message:userMessage.credentialError});
            return;
        }
        if(userExist?.password===undefined || userExist?.password==null){
            return
        }
        console.log(userExist.password)
        const comparePassword=await bcrypt.compare(password,userExist.password);

        if(!comparePassword){
            res.status(404).json({message:userMessage.credentialError});
            return;
        }
        const token=jwt.sign({
            userId:userExist.id
        },JWT_KEY);

        res.status(200).json({message:userMessage.logged,token});
        
    } catch (error) {
        return res.status(404).json({message:userMessage.error})

        
    }
}