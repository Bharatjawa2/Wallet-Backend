export const response = (res,status,message,data=null)=>{
    return res.status(status).json({
        success:status < 400,
        message,
        ...(data && {data})
    })
}