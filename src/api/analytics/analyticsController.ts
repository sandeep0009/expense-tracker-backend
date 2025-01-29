import { analyticMessage, userMiddleware } from "../../constant/constant";
import { Response, Request } from "express";
import { client } from "../../helper/prismaClient";

const calculateDateRanges = (timeRange: number) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - timeRange);

  const prevEndDate = new Date(startDate);
  const prevStartDate = new Date();
  prevStartDate.setDate(prevEndDate.getDate() - timeRange);

  return { startDate, endDate, prevStartDate, prevEndDate };
};

export const getAnalytics = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: userMiddleware.unauthorized });
      return;
    }

    const timeRange = parseInt(req.query.timeRange as string) || 30;
    const { startDate, endDate, prevStartDate, prevEndDate } = calculateDateRanges(timeRange);
    const spendingResponse = await client.expense.aggregate({
      _sum: { spentMoney: true },
      where: { userId, date: { gte: startDate, lte: endDate } },
    });
    const prevSpendingResponse = await client.expense.aggregate({
      _sum: { spentMoney: true },
      where: { userId, date: { gte: prevStartDate, lte: prevEndDate } },
    });
    const transactionCount = await client.expense.count({
      where: { userId, date: { gte: startDate, lte: endDate } },
    });

    const prevTransactionCount = await client.expense.count({
      where: { userId, date: { gte: prevStartDate, lte: prevEndDate } },
    });
    const categorySpending = await client.expense.groupBy({
      by: ['category'],
      _sum: { spentMoney: true },
      where: { userId, date: { gte: startDate, lte: endDate } },
    });

    const totalSpending = spendingResponse._sum.spentMoney || 0;
    const prevSpending = prevSpendingResponse._sum.spentMoney || 0;
    const percentageChange = prevSpending ? ((totalSpending - prevSpending) / prevSpending) * 100 : 0;

    const averageDailySpending = totalSpending / timeRange;

    const topCategory = categorySpending.sort((a, b) => (b._sum.spentMoney || 0) - (a._sum.spentMoney || 0))[0];

    res.status(200).json({
      message: analyticMessage.avgDaily,
      result: {
        totalSpending,
        percentageChange,
        averageDailySpending,
        totalTransactions: transactionCount,
        transactionChange: transactionCount - prevTransactionCount,
        topCategory: {
          category: topCategory?.category || "N/A",
          percentage: topCategory ? ((topCategory._sum.spentMoney || 0) / totalSpending) * 100 : 0,
        },
      },
    });
  } catch (error) {
    res.status(501).json({ message: analyticMessage.error });
  }
};


export const getCategoryDistribution=async(req:Request,res:Response):Promise<any>=>{
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: userMiddleware.unauthorized });
      return;
    }
    const categories = await client.expense.findMany({
      where: { userId },
      select: { category: true }, 
      distinct: ["category"],
    });
    const categoryList = categories.map((item) => item.category);

    res.status(200).json({ success: true, data: categoryList });
    
  } catch (error) {
    res.status(501).json({ message: analyticMessage.error });

    
  }
}