import ratelimit from "../config/upstash.js";
import { response } from "../utils/response.js";

const ratelimiter = async(req,res,next)=>{
    try {
        const ip = req.ip;
        const {success} = await ratelimit.limit(ip)
        if(!success){
            return response(res,429,"Too many Requests, try again later")
        }
        next();
    } catch (error) {
        console.log("Rate Limit Error : ",error);
        next(error);
    }
}

export default ratelimiter;