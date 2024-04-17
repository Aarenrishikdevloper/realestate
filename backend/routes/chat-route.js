import express from 'express'; 
import { VerifyToken } from '../middleware.js';
import prisma from '../lib/prisma.js';
const router = express.Router(); 

router.post('/add', VerifyToken, async(req, res)=>{
    const userId = req.userId;   
    const recieverUserId = req.body.recieverId; 

  
    try{ 
        const newChat = await prisma.chat.create({
            data:{
                userChats:{
                    createMany:{
                        data:[
                             {userId:userId},  
                             {userId:recieverUserId}
                        ]
                    }
                }
            }, 
            include:{
                userChats:true
            }
        })  
        res.status(200).json(newChat);
     
    }catch(err){ 
        console.log("Chat_api_error", err); 
        res.status(500).json("Internal Server Error")
    }
})  


export default router;