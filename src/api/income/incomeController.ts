import { incomeMessage, userMiddleware } from "../../constant/constant";
import { Request ,Response} from "express";
import { client } from "../../helper/prismaClient";


export const createIncome=async(
    req:Request,
    res:Response
):Promise<any>=>{
    try {
        const {amount,source}=req.body;
        const userId=req.userId;

        if(!userId){
            res.status(401).json({message:userMiddleware.unauthorized});
            return;
        }
    
        const data=await client.income.create({
            data:{
                amount,
                source,
                userId
            }
        });

        res.status(201).json({message:incomeMessage.created,data});
        
    } catch (error) {
        res.status(404).json({message:incomeMessage.error});
        
    }
}


export const getIncome=async(
    req:Request ,
    res:Response

):Promise<any>=>{
    try {
        const userId=req.userId;
        if(!userId){
            res.status(401).json({message:userMiddleware.unauthorized});
            return;

        }
        const data=await client.income.findMany(
            {
                where:{
                    userId:userId
                }
            }
        );
        res.status(200).json({message:incomeMessage.fetched,data});
        
    } catch (error) {
        res.status(404).json({message:incomeMessage.error});

        
    }
}


export const updateIncome=async(
    req:Request,
    res:Response
):Promise<any>=>{
    try {        
        const userId=req.userId;
        const {income,source}=req.body
        if(!userId){
            res.status(401).json({message:userMiddleware.unauthorized});
            return;

        }
        const data=await client.income.updateMany(
           {
            where:{
                userId:userId
            },
            data:{
                amount:income,
                source:source

            }
           }
        );
        res.status(200).json({message:incomeMessage.updated,data});
        
    } catch (error) {
        res.status(404).json({message:incomeMessage.error});
    }
}