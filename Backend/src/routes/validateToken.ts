import {
  NextFunction,
  Request,
  Response,
} from 'express';
import jwt from 'jsonwebtoken';

const validateToken = (req: Request, res: Response, next:NextFunction)=>{
    const headersToken  = req.headers['authorization']

    console.log(headersToken)
    if (headersToken != undefined && headersToken.startsWith('Bearer ')){
       try{
        const token = headersToken.slice(7);
        if (!process.env.ENCRYPTION_KEY) {
            throw new Error('SECRET_KEY is not defined in environment variables');
        }
        jwt.verify(token, process.env.ENCRYPTION_KEY);
        next()
       }catch (error){
        res.status(401).json({
            msg:`La sesión ha terminado`
        })
       }
    }else{
        res.status(401).json({
            msg:`Acceso denegado`
        })
    }
  
}

export default validateToken;