import jwt from "jsonwebtoken"

export const getToken=async(id, role,college)=>{
    const token= await jwt.sign({id,role,college},process.env.JWT_SECRET,{
     expiresIn:"7d",
    })
    console.log(token)
    return token
}