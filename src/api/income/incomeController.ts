import { incomeMessage, userMiddleware } from "../../constant/constant";
import { Request ,Response} from "express";
import { client } from "../../helper/prismaClient";
import { Source } from "@prisma/client";


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
        const parseAmount=parseInt(amount)
    
        const data=await client.income.create({
            data:{
                amount:parseAmount,
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
        const {page=0,limit=5,search=""}=req.query;

        const currentPage=parseInt(page as string,10);
        const rowsPerPage=parseInt(limit as string,10);
        const searchQuery=search as string;

        const enumValues=Object.values(Source).filter((v)=>
        v.toLowerCase().includes(searchQuery.toLowerCase())
        )
        const all_data=await client.income.findMany(
            {
                where:{
                    userId:userId,
                    source:{
                        in:enumValues
                        
                    }
                },
              
                skip:(currentPage-1)*rowsPerPage,
                take:rowsPerPage
            }
        );
        const total_data=await client.income.aggregate({
            _sum:{
                amount:true
            },
            where:{
                userId:userId,
                source:{
                    in:enumValues
                    
                }
            },
            skip:(currentPage-1)*rowsPerPage,
            take:rowsPerPage
        });
        const resultTotal=total_data._sum.amount || 0;

        const percentData = all_data.map((item) => ({
            ...item,
            percentage: resultTotal
              ? ((item.amount / resultTotal) * 100).toFixed(2)
              : "0.00",
          }));

          const result = {
            all_data,
            data: percentData,
            totalAmount: resultTotal,
            currentPage,
            rowsPerPage,
          };
      
          res.status(200).json({ message: incomeMessage.fetched, result });
        
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