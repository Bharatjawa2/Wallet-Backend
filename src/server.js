import express from "express";
import "dotenv/config";
import ratelimiter from "./middleware/rateLimiter.js";
import transactionsRouter from "./routes/transactionRouter.js";
import { response } from "./utils/response.js";
import { initDB } from "./config/database.js";

const app = express();
app.set("trust proxy", 1);
// middlewares
app.use(ratelimiter);
app.use(express.json()); // built-in Middleware

const PORT = process.env.PORT || 8003;

app.get("/ping",(req,res)=>{
    return response(res,200,"Hey, Buddy !!! What's up...")
})

app.use("/transactions",transactionsRouter)

initDB().then(()=>{
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
})