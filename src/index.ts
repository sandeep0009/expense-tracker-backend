import express from "express";
import cors from "cors";
import router from "./routes";
import './types'
const app=express();


app.use(cors());
app.use(
    cors({
      origin: ["https://vercel.com/sandeep0009s-projects/expense-tracker-frontend-yawt"],
      methods: ["GET", "POST", "PUT", "DELETE"], 
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true, 
    })
  );
app.use(express.json());
app.use(router);

app.listen(3000,()=>{
    console.log('connected to backend')
});