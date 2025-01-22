import { Request,Response } from "express"
import { expenseMessage, userMiddleware } from "../../constant/constant"
import { client } from "../../helper/prismaClient";
export const createExpense=async(
    req:Request,
    res:Response
):Promise<any>=>{
    try {
        const{title,category,spentMoney}=req.body;
        const userId=req.userId;
         if(!userId){
            res.status(401).json({message:userMiddleware.unauthorized});
            return;
        }
        const data=await client.expense.create({
            data:{
                title,
                category,
                spentMoney,
                userId
            }
        });
        res.status(201).json({message:expenseMessage.created,data});
        
    } catch (error) {
        res.status(404).json({message:expenseMessage.error});
        
    }
}

export const allExpense=async(
    req:Request,
    res:Response
):Promise<any>=>{
    try {
        const response=await client.expense.findMany();
        res.status(200).json({message:expenseMessage.fetchedAll,response});
        
    } catch (error) {
        res.status(404).json({message:expenseMessage.error});

        
    }
}

export const filterQuery = async (req: Request, res: Response): Promise<any> => {
    try {
      const { category, timeRange, type } = req.query;
      const userId = req.userId; 
  
      if (!userId) {
        res.status(401).json({ message: userMiddleware.unauthorized });
        return;
      }
      const filter: any = { userId };
      if (category && category !== "all") {
        filter.category = category;
      }
      if (timeRange) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeRange as string, 10));
        filter.createdAt = { gte: startDate };
      }

      if (type) {
        filter.type = type
      }
      const response = await client.expense.findMany({
        where: filter,
        orderBy: { createdAt: "desc" },
      });
  
      res.status(200).json({ message: expenseMessage.fetchedCategory, response });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: expenseMessage.error });
    }
  };
  