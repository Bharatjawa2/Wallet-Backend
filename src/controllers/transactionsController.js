import { sql } from "../config/database.js";
import { response } from "../utils/response.js";

export const createTransaction = async(req,res)=>{
  try {
    const {title,amount,category,user_id}=req.body;
    if(!title || !user_id || !category || amount===undefined){
      return response(res,400,"All Fields are required")
    }

    const transaction=await sql`INSERT INTO transactions(user_id,title,amount,category) VALUES (${user_id},${title},${amount},${category}) RETURNING *`
    console.log("Transaction Posted : ",transaction)

    return response(res,201,"Transaction Created Successfully",transaction[0])
  } catch (error) {
    console.log("Error Creating the transactions : ",error)
    return response(res,500,"Internal Server Error")
  }
}

export const getTransactionsByUser = async(req,res)=>{
  try {
    const {userId}=req.params;

    const transaction=await sql`SELECT * from transactions WHERE user_id = ${userId} ORDER BY created_at DESC`
    console.log("Transaction Fetched : ",transaction)

    return response(res,200,"Transactions Fetched Successfully",transaction)
  } catch (error) {
    console.log("Error Fetching the transactions : ",error)
    return response(res,500,"Internal Server Error")
  }
}

export const deleteTransaction = async(req,res)=>{
  try {
    const {id}=req.params;

    if(isNaN(parseInt(id))){
      return response(res,400,"Invalid Transaction ID")
    }

    const deletedTransaction=await sql`DELETE FROM transactions WHERE id=${id} RETURNING *`;

    if(deletedTransaction.length===0){
      return response(res,404,"Transaction Not Found")
    }

    return response(res,200,"Transaction Deleted Successfully")
  } catch (error) {
    console.log("Error Deleting the transactions : ",error)
    return response(res,500,"Internal Server Error")
  }
}

export const getTransactionSummary = async(req,res)=>{
  try {
    const {userId}=req.params;

    const balanceResult=await sql`SELECT COALESCE(SUM(amount),0) as balance FROM transactions WHERE user_id = ${userId}`
    const incomeResult=await sql`SELECT COALESCE(SUM(amount),0) as income FROM transactions WHERE user_id = ${userId} AND amount>0`;
    const expensesResult=await sql`SELECT COALESCE(SUM(amount),0) as expenses FROM transactions WHERE user_id = ${userId} AND amount<0`;

    return response(res,200,"Transaction Summary Fetched Successfully",{
      balance:balanceResult[0].balance,
      income:incomeResult[0].income,
      expenses:expensesResult[0].expenses
    })
  } catch (error) {
    console.log("Error Fetching the transactions Summary : ",error)
    return response(res,500,"Internal Server Error")
  }
}