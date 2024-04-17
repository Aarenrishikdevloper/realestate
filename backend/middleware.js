import jwt from 'jsonwebtoken'; 

export const VerifyToken =(req,res,next) => {
    const token = req.cookies.token; 

    if(!token) return res.status(401).json({message:"unauthorized"}); 

    jwt.verify(token, process.env.JWT_KEY, async(err, payload)=>{
        if(err) return res.status(401).json({message:"unauthorized"});  
        req.userId = payload.id

        next();
    })
}