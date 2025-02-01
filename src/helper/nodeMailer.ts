import nodemailer from "nodemailer";

export const transport=nodemailer.createTransport({
    service:"Gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
})
