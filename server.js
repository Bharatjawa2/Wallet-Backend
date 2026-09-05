import express from "express";
import "dotenv/config";
import { sql } from "./config/database.js";
import ratelimiter from "./middleware/rateLimiter.js";

const app = express();
app.set("trust proxy", 1);
// middlewares
app.use(ratelimiter);
app.use(express.json()); // built-in Middleware

const PORT = process.env.PORT || 8003;

async function initDB() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions(
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      category VARCHAR(255) NOT NULL,
      created_at DATE NOT NULL DEFAULT CURRENT_DATE
    )`;
    console.log("DATABASE Initialized Successfully...")
  } catch (error) { 
    console.log("Error in Initializing DATABSE : ",error)
    process.exit(1);
  }
}

app.get("/ping",(req,res)=>{
    res.send("Hey, Buddy !!! What's up...")
})

app.post("/api/transactions",async(req,res)=>{
  try {
    const {title,amount,category,user_id}=req.body;
    if(!title || !user_id || !category || amount===undefined){
      return res.status(400).json({message:"All Fields are required"})
    }
    const transaction=await sql`INSERT INTO transactions(user_id,title,amount,category) VALUES (${user_id},${title},${amount},${category}) RETURNING *`
    console.log("Transaction Posted : ",transaction)
    res.status(201).json(transaction[0]); 

  } catch (error) {
    console.log("Error Creating the transactions : ",error)
    return res.status(500).json({message:"Internal Server Error"})
  }
})

app.get("/api/transactions/:userId",async(req,res)=>{
  try {
    const {userId}=req.params;
    const transaction=await sql`SELECT * from transactions WHERE user_id = ${userId} ORDER BY created_at DESC `
    console.log("Transaction Fetched : ",transaction)
    res.status(201).json(transaction); 
  } catch (error) {
    console.log("Error Fetching the transactions : ",error)
    return res.status(500).json({message:"Internal Server Error"})
  }
})

app.delete("/api/transactions/:id",async(req,res)=>{
  try {
    const {id}=req.params;
    if(isNaN(parseInt(id))){
      return res.status(400).json({message:"Invalid Transaction ID"})
    }
    const deletedTransaction=await sql`DELETE FROM transactions WHERE id=${id} RETURNING *`;
    if(deletedTransaction.length===0){
      return res.status(404).json({message:"Transaction Not Found"})
    }
    return res.status(201).json({message:"Transaction Deleted Successfully"})
  } catch (error) {
    console.log("Error Deleting the transactions : ",error)
    return res.status(500).json({message:"Internal Server Error"})
  }
})

app.get("/api/transactions/summary/:userId",async(req,res)=>{
  try {
    const {userId}=req.params;
    const balanceResult=await sql`SELECT COALESCE(SUM(amount),0) as balance FROM transactions WHERE user_id = ${userId}`
    const incomeResult=await sql`SELECT COALESCE(SUM(amount),0) as income FROM transactions WHERE user_id = ${userId} AND amount>0`;
    const expensesResult=await sql`SELECT COALESCE(SUM(amount),0) as expenses FROM transactions WHERE user_id = ${userId} AND amount<0`;

    res.status(201).json({
      balance : balanceResult[0].balance,
      income : incomeResult[0].income,
      expenses : expensesResult[0].expenses,
    }); 
  } catch (error) {
    console.log("Error Fetching the transactions Summary : ",error)
    return res.status(500).json({message:"Internal Server Error"})
  }
})

initDB().then(()=>{
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
})