import express from "express"
import { createTransaction, getTransactionsByUser, deleteTransaction, getTransactionSummary } from "../controllers/transactionsController.js";

const transactionsRouter=express.Router();

// POST
transactionsRouter.post("/",createTransaction)

// GET
transactionsRouter.get("/summary/:userId",getTransactionSummary)
transactionsRouter.get("/:userId",getTransactionsByUser)

// DELETE
transactionsRouter.delete("/:id",deleteTransaction)

export default transactionsRouter;