import  jwt  from "jsonwebtoken";
import {Request, Response, NextFunction} from "express"
import { getEnv } from "../../config/env";

const authMiddleware = (req:Request, res:Response, next:NextFunction ) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    const env = getEnv()
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const secret = env.JWT_SECRET;
      if(!secret){
        return res.status(500).json({error:"JWT secret not correctly configured"})
      }
      const decoded = jwt.verify(token, secret) as unknown as {userId:string, role:string, email:string}
      if(typeof decoded === "string" || !decoded){
        return res.status(401).json({error:"Invalid token"})
      }
      req.userId = decoded.userId
      req.userRole = decoded.role
      req.userEmail = decoded.email
      next();
    }
    catch (err) {
      console.error("Error ",err)
      res.status(401).json({ message:"unauthorized" })
    }
  };

  export default authMiddleware;
