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
        const spendMoney=parseInt(spentMoney);
        const data=await client.expense.create({
            data:{
                title,
                category,
                spentMoney:spendMoney,
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
      res.status(500).json({ message: expenseMessage.error });
    }
  };
  


  export const deleteExpense=async(
    req:Request,
    res:Response
  ):Promise<any>=>{
    try {
        const userId=req.userId;
        if (!userId) {
            res.status(401).json({ message: userMiddleware.unauthorized });
            return;
        }
        const {delteid}=req.params;
        await client.expense.delete({where:{
            id:delteid
        }});
        res.status(200).json({message:expenseMessage.deleted});
        
    } catch (error) {
        res.status(500).json({ message: expenseMessage.error });        
    }
};


export const updateExpense=async(
    req:Request,
    res:Response
):Promise<any>=>{
    try {
        const userId=req.userId;
        if (!userId) {
            res.status(401).json({ message: userMiddleware.unauthorized });
            return;
        }

        const{data}=req.body;
        const {expenseId}=req.params;
        const updatedDate=await client.expense.updateMany(
            {
                where:{
                    id:expenseId
                },
                data:{
                    ...data
                }
            }
        );
        res.status(200).json({message:expenseMessage.updated,updatedDate})
    } catch (error) {
        res.status(500).json({ message: expenseMessage.error });

        
    }
}


export const getDashboard=async(
    req:Request,
    res:Response
):Promise<any>=>{
    try {
        const userId=req.userId;
        if (!userId) {
            res.status(401).json({ message: userMiddleware.unauthorized });
            return;
        }
        const totalIncome=await client.income.aggregate(
            {
                _sum:{
                    amount:true
                },
                where:{
                    userId
                }
            }
            
        );
        const currentMonth=new Date().getMonth()+1;
        const currentYear=new Date().getFullYear();
        const monthlyExpense=await client.expense.aggregate(
            {
                _sum:{
                    spentMoney:true
                },
                where:{
                    userId,
                    date:{
                        gte:new Date(`${currentYear}-${currentMonth}-01`),
                        lt: new Date(`${currentYear}-${currentMonth + 1}-01`),
                    }
                }
            }
        );


        const totalExpense=await client.expense.aggregate({
            _sum:{
                spentMoney:true
            },
            where:{
                userId
            }
        });

        const totalIncomeValue=totalIncome._sum.amount || 0;
        const totalExpenseValue=totalExpense._sum.spentMoney || 0;
        const savings=Math.abs(totalIncomeValue-totalExpenseValue);

        let result=[];
        result.push(totalExpenseValue);
        result.push(totalIncomeValue);
        result.push(savings);
        result.push(monthlyExpense._sum.spentMoney || 0);
        res.status(200).json({message:expenseMessage.dashboard,result});


        
    } catch (error) {
        res.status(500).json({ message: expenseMessage.error });

        
    }
}


export const recentTransaction=async(
    req:Request,
    res:Response
):Promise<any>=>{
    try {
        const userId=req.userId;
        if (!userId) {
            res.status(401).json({ message: userMiddleware.unauthorized });
            return;
        }
        const currentTransaction=await client.expense.findMany({
            where:{
                userId
            },
            orderBy:{
                createdAt:"desc"
            },
            take:5
        });
        res.status(200).json({message:expenseMessage.recentTransaction,currentTransaction});
        
    } catch (error) {
        res.status(500).json({ message: expenseMessage.error });
        
    }
}

export const spendingOverview=async(
    req:Request,
    res:Response
):Promise<any>=>{
    try {
        const userId=req.userId;
        if (!userId) {
            res.status(401).json({ message: userMiddleware.unauthorized });
            return;
        }
        const {days}=req.params;
        const numberOfDays=parseInt(days);

        const currentDate=new Date();
        const startDate=new Date(currentDate);
        startDate.setDate(currentDate.getDate()-numberOfDays);
        const overviewData=await client.expense.groupBy(
            {
                by:["category"],
                _sum:{
                    spentMoney:true
                },
                where:{
                    userId,
                    date:{
                        gte:startDate,
                        lte:currentDate
                    }
                }
            }
        );

        const formatData=overviewData.map((data)=>({
            category:data.category,
            totalSpentMoney:data._sum.spentMoney ||0
        }));
        res.status(200).json({message:expenseMessage.overView,formatData});
        
    } catch (error) {
        res.status(500).json({ message: expenseMessage.error });

        
    }
}