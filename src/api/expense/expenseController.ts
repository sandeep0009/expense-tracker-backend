import { Request,Response } from "express"
import { expenseMessage, userMiddleware } from "../../constant/constant"
import { client } from "../../helper/prismaClient";
import { createExpenseValidaiton } from "../../helper/zodValidation";
export const createExpense=async(
    req:Request,
    res:Response
):Promise<any>=>{
    try {
        const{title,category,spentMoney}=req.body;

        const validCheck=createExpenseValidaiton.safeParse(req.body);
        if(!validCheck){
            res.status(404).json({message:"please provide valid data"});
            return;
        }
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

export const filterQuery = async (req: Request, res: Response): Promise<void> => {
    try {

        const userId=req.userId;
         if(!userId){
            res.status(401).json({message:userMiddleware.unauthorized});
            return;
        }
        const {
            page = "1",
            limit = "10",
            search = "",
            range,
            category,
            type,
        } = req.query;

        const currentPage = parseInt(page as string, 10);
        const rowsPerPage = parseInt(limit as string, 10);

        if (isNaN(currentPage) || currentPage < 1 || isNaN(rowsPerPage) || rowsPerPage < 1) {
             res.status(400).json({ message: "Invalid pagination parameters." });
        }

        const skip = (currentPage - 1) * rowsPerPage;
        const filters: any = { userId };

        if (search) {
            filters.OR = [
                { title: { contains: search as string, mode: "insensitive" } },
                { description: { contains: search as string, mode: "insensitive" } },
            ];
        }

        if (category) {
            filters.category = category;
        }

        if (type) {
            filters.type = type;
        }

        if (range) {
            const [start, end] = (range as string).split(",");
            filters.createdAt = {
                gte: new Date(start),
                lte: new Date(end),
            };
        }

        const transactions = await client.expense.findMany({
            where: filters,
            skip,
            take: rowsPerPage,
            orderBy: { createdAt: "desc" },
        });

        const total = await client.expense.count({ where: filters });

        let result={
            transactions,total
        }

        res.status(200).json({ message: expenseMessage.fetchedCategory, result });
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

        const totalIncomeValue = totalIncome._sum.amount || 0;
        const totalExpenseValue = totalExpense._sum.spentMoney || 0;
        const savings = Math.abs(totalIncomeValue - totalExpenseValue);
        const monthly = monthlyExpense._sum.spentMoney || 0;

        const totalIncomeAndExpense = totalIncomeValue + totalExpenseValue;
        const incomePercentage = totalIncomeAndExpense > 0 ? (totalIncomeValue / totalIncomeAndExpense) * 100 : 0;
        const expensePercentage = totalIncomeAndExpense > 0 ? (totalExpenseValue / totalIncomeAndExpense) * 100 : 0;
        const savingsPercentage = totalIncomeValue > 0 ? (savings / totalIncomeValue) * 100 : 0;
        const monthlyExpensePercentage = totalExpenseValue > 0 ? (monthly / totalExpenseValue) * 100 : 0;

        const resultArray = [
            { label: 'Total Income', value: totalIncomeValue },
            { label: 'Total Expense', value: totalExpenseValue },
            { label: 'Savings', value: savings },
            { label: 'Monthly Expense', value: monthly },
            { label: 'Income Percentage', value: incomePercentage },
            { label: 'Expense Percentage', value: expensePercentage },
            { label: 'Savings Percentage', value: savingsPercentage },
            { label: 'Monthly Expense Percentage', value: monthlyExpensePercentage }
        ];

        res.status(200).json({message:expenseMessage.dashboard,resultArray});

        


        
    } catch (error) {
        res.status(500).json({ message: expenseMessage.error});

        
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
        const { days } = req.query;
        const numberOfDays = parseInt(days as string, 10);

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


export const spendingTrends = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized access." });
            return;
        }

        const { viewMode } = req.query;
        if (!viewMode) {
            res.status(400).json({ message: "Please specify a valid viewMode (daily, weekly, or monthly)." });
            return;
        }

        let startDate: Date | null = new Date();
        let periodFormatter: (date: Date) => string;

        switch (viewMode) {
            case "daily":
                startDate.setDate(startDate.getDate() - 7);
                periodFormatter = (date) => date.toISOString().split("T")[0];
                break;
            case "weekly":
                startDate.setFullYear(startDate.getFullYear() - 1);
                periodFormatter = (date) => {
                    const week = Math.ceil(date.getDate() / 7);
                    return `${date.getFullYear()}-W${week}`;
                };
                break;
            case "monthly":
                startDate.setDate(startDate.getDate() - 30);
                periodFormatter = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                break;
            default:
                res.status(400).json({ message: "Invalid viewMode provided." });
                return;
        }

        const spendTrends = await client.expense.groupBy({
            by: ["createdAt"],
            where: {
                userId,
                createdAt: {
                    gte: startDate,
                },
            },
            _sum: {
                spentMoney: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        const trendsData = spendTrends.map((trend) => ({
            period: periodFormatter(new Date(trend.createdAt)),
            totalAmount: trend._sum?.spentMoney || 0,
        }));

        res.status(200).json({ spendingTrends: trendsData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
};
