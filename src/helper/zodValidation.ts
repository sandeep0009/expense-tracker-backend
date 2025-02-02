import z from "zod";
export const userSchemaVaildation=z.object({

     name:z.string(),
     email:z.string().nonempty().email(),
     password:z.string().min(4).max(8),
     imageUrl: z.string().optional(),
});

export const userLoginValidation=z.object({
    password:z.string().min(4).max(8),
    email:z.string().nonempty().email()
});

export const createIncomeValidation=z.object({
    amount:z.number().positive(),
    source:z.string().nonempty()
});

export const createExpenseValidaiton=z.object({
    title:z.string().nonempty().min(2),
    category:z.string().nonempty(),
    spentMoney:z.number().positive()
})