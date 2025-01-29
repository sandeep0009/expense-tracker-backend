import z from "zod";
export const userSchemaVaildation=z.object({

     name:z.string().min(8),
     email:z.string().nonempty().email(),
     password:z.string().min(4).max(8).regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,8}$/, "Password must contain at least one letter, one number, and one special character"),
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