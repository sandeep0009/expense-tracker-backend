import { NextFunction,Request,Response } from "express";
import { userMiddleware } from "../constant/constant";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_KEY } from "../config/config";

export const verifyUser=async(
    req:Request,
    res:Response,
    next:NextFunction
):Promise<any>=>{
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(" ")[1];
        console.log(token)

        if(!token){
            res.status(401).json({message:userMiddleware.notValid});
            return;
        }
        const decoded=jwt.verify(token,JWT_KEY) as JwtPayload;
        if (typeof decoded === "string") {
            return false;
        }
        req.userId = decoded.userId;
        next();

        
    } catch (error) {
        res.status(404).json({message:userMiddleware.error})
        
    }

}