import ratelimit from "../config/upstash.js";

const ratelimiter = async(req,res,next)=>{
    try {
        const ip = req.ip;
        const {success} = await ratelimit.limit(ip)
        if(!success){
            return res.status(429).json({message:"Too many Requests, try again later"})
        }
        next();
    } catch (error) {
        console.log("Rate Limit Error : ",error)
        next(error)
    }
}

export default ratelimiter;