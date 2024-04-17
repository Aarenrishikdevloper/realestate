import express from 'express'; 
import { VerifyToken } from '../middleware.js';
import bycrypt from 'bcryptjs'
import prisma from '../lib/prisma.js';
const router = express.Router(); 

router.patch('/:id', VerifyToken, async(req,res)=>{
    const id = req.params.id;   
    const tokenUserid = req.userId;   
    if(id !==tokenUserid){
        return res.status(403).json({message:"Unauthorize"});
    }

    const{password, avatar, ...inputs} = req.body; 
   
    const user = await prisma.user.findFirst({where:{id}});  
    if(!user){
        return res.status(403).json({message:"Unauthorize"});
    }
    let updatedPassword = null; 
    try{
        if(updatedPassword){
            updatedPassword = await bycrypt.hash(password, 10);
        } 
        const updateUser = await prisma.user.update({
            where:{id},  
            data:{
                ...inputs,  
                ...(updatedPassword &&{password:updatedPassword}),  
                ...(avatar&&{avatar})
            }
        })
        const user={
            id:updateUser.id, 
            username:updateUser.username, 
            avatar:updateUser.avatar,
            email:updateUser.email,
        }
        res.status(200).json(user);
    }catch(e){
        console.log("error_update_user_api", e);  
        res.status(500).json({message:"Internal Server Error"});
    }
})  
router.post('/saved', VerifyToken, async(req, res)=>{
    const postId = req.body.postId; 
    const tokenUserId = req.userId;  
    try{ 
        const savedpost  = await prisma.savedPost.findUnique({where:{userId:tokenUserId, postId}}); 

        if(savedpost){
            
            await prisma.savedPost.delete({where:{id:savedpost.id}}); 
             res.status(200).json({message:"Unsaved Sucessfully"})
        }else{
           await prisma.savedPost.create({
             data:{
                userId:tokenUserId, 
                postId
             }
           })
           res.status(200).json({message:"Saved Sucessfully"})
        }

    }catch(e){
        console.log("error_saved_post_api", e);  
        res.status(500).json({message:"Internal Server Error"});
    }
})
router.get('/profilepost', VerifyToken, async(req, res)=>{
   const tokenUserid = req.userId; 
   try{
   const userPosts = await prisma.post.findMany({where:{userId:tokenUserid}});   
   const saved  = await prisma.savedPost.findMany({where:{userId:tokenUserid}, select:{postId:true}})  
   const allposts = await prisma.post.findMany();
   const savedpostIds  = saved.map(item=>item.postId);  
   
   const savedposts  = allposts.filter(post=>savedpostIds.includes(post.id)).map(post=>({
     ...post,    
     isSaved:savedpostIds.includes(post.id)
   }))

  
   
   
   
  

   res.status(200).json({userPosts, savedposts}); 
   }catch(e){
      console.log(e); 
      res.status(500).json({message:"Intternal server error"})
   }

})
export default router;