import express from "express";
import cors from "cors";
import router from "./routes";
import './types'
const app=express();

app.use(cors());
app.use(express.json());
app.use(router);

app.listen(3000,()=>{
    console.log('connected to backend')
});