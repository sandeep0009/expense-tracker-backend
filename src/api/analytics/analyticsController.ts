import { analyticMessage, userMessage, userMiddleware } from "../../constant/constant";
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

export const totalSpending = async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ message: userMiddleware.unauthorized });
        return;
      }
  
      const timeRange = parseInt(req.query.timeRange as string) || 30;
      const { startDate, endDate, prevStartDate, prevEndDate } = calculateDateRanges(timeRange);
  
      const response = await client.expense.aggregate({
        _sum: { spentMoney: true },
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
      });
  
      const previousSpending = await client.expense.aggregate({
        _sum: { spentMoney: true },
        where: {
          userId,
          date: { gte: prevStartDate, lte: prevEndDate },
        },
      });
  
      const currentSpending = response._sum.spentMoney ?? 0;
      const prevSpending = previousSpending._sum.spentMoney ?? 0;
      const percentageChange = prevSpending
        ? ((currentSpending - prevSpending) / prevSpending) * 100
        : 0;
  
      const result = { totalSpending: currentSpending, percentageChange };
  
      res.status(200).json({ message: analyticMessage.totalSpendingMsg, result });
    } catch (error) {
      res.status(501).json({ message: analyticMessage.error });
    }
  };
  

export const averageDaily = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: userMiddleware.unauthorized });
      return;
    }

    const timeRange = parseInt(req.query.timeRange as string) || 30;
    const { startDate, endDate } = calculateDateRanges(timeRange);

    const response = await client.expense.aggregate({
      _sum: { spentMoney: true },
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
    });

    const averageDailySpending = (response._sum.spentMoney || 0) / timeRange;

    res.status(200).json({
      message: analyticMessage.avgDaily,
      result: { averageDailySpending },
    });
  } catch (error) {
    res.status(501).json({ message: analyticMessage.error });
  }
};

export const topTransaction = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: userMiddleware.unauthorized });
      return;
    }

    const timeRange = parseInt(req.query.timeRange as string) || 30;
    const { startDate, endDate } = calculateDateRanges(timeRange);

    const topTransaction = await client.expense.findFirst({
      where: { userId, date: { gte: startDate, lte: endDate } },
      orderBy: { spentMoney: 'desc' },
    });

    res.status(200).json({
      message: analyticMessage.topTransaction,
      result: topTransaction || {},
    });
  } catch (error) {
    res.status(501).json({ message: analyticMessage.error });
  }
};

export const topCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: userMiddleware.unauthorized });
      return;
    }

    const timeRange = parseInt(req.query.timeRange as string) || 30;
    const { startDate, endDate } = calculateDateRanges(timeRange);

    const categorySpending = await client.expense.groupBy({
      by: ['category'],
      _sum: { spentMoney: true },
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
    });

    const totalSpending = categorySpending.reduce((sum, cat) => sum + (cat._sum.spentMoney || 0), 0);
    const topCategory = categorySpending.sort((a, b) => (b._sum.spentMoney || 0) - (a._sum.spentMoney || 0))[0];

    res.status(200).json({
      message: analyticMessage.topcategory,
      result: {
        category: topCategory.category,
        percentage: ((topCategory._sum.spentMoney || 0) / totalSpending) * 100,
      },
    });
  } catch (error) {
    res.status(501).json({ message: analyticMessage.error });
  }
};
