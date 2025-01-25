import { Request,Response } from "express"
import { budgetMessage, userMiddleware } from "../../constant/constant"

export const createBudget=async(
    req:Request,
    res:Response
):Promise<any>=>{
    try {
        const userId=req.userId;
        if(!userId){

        } if (!userId) {
                res.status(401).json({ message: userMiddleware.unauthorized });
                return;
              }
    } catch (error) {
        res.status(501).json({
            message:budgetMessage.error
        })
        
    }
}