import express from 'express'; 
import { VerifyToken } from '../middleware.js';
import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
const router = express.Router(); 


router.post('/add', VerifyToken, async(req, res)=>{
   const body = req.body; 
   const tokenuserid = req.userId; 
   try{
        const newPost = await prisma.post.create({
          data:{
            ...body.postData,  
            userId:tokenuserid, 
            postDetail:{
              create:body.postDetail
            }
          }
        })
        res.status(200).json(newPost)
   }catch(e){
     console.log(e)
     res.status(500).json({message:"Internal Server Error"})
   }
}) 
router.get('/:id', async(req,res)=>{
   const id = req.params.id; 
   try{
   const post = await prisma.post.findUnique({
    where:{id},  
    include:{
      postDetail:true,   
      user:{
        select:{
          username:true,  
          avatar:true
        }
      }
    }
   }) 
   const token = req.cookies?.token; 
   if(token){
     jwt.verify(token,process.env.JWT_KEY, async(err, payload) => {
      if(!err){
        const saved  = await prisma.savedPost.findUnique({
          where:{
            userId_postId:{
              postId:id, 
              userId:payload.id
            }
          }
        })
        res.status(200).json({...post, isSaved:saved?true:false})

      }
     })
   }else{
    res.status(200).json({...post, isSaved:false});
   }
   
  }catch(e){
    console.log("get_post_byid", e); 
    res.status(500).json({message:"Internal Server Error"})
  }
})
router.get('/', async(req,res)=>{
  const query = req.query;  
  try{ 
    const posts = await prisma.post.findMany({
      where:{
        city:query.city || undefined,   
        type:query.type || undefined,  
        propertry:query.propertry || undefined,   
        bedroom: parseInt(query.bedroom) || undefined, 
        price:{
          gte:parseInt(query.minPrice) || undefined, 
          lte:parseInt(query.maxPrice) || undefined
        }  
      }
    })    

    const saved  = await prisma.savedPost.findMany({
      where:{
        postId:{
          in:posts.map(post=>post.id)
        }
       
      }, 
      select:{
        postId:true
      }
      
    })  
    const savedPostsIds = new Set(saved.map(saved => saved.postId)); 
    const postsaved  = posts.map(post => ({
      ...post,  
      isSaved:savedPostsIds.has(post.id)

    }))

   
      res.status(200).json(postsaved);
    
 

  }catch(e){
    console.log("get_api", e); 
    res.status(500).json({message:"Internal Server Error"})
  }
})

router.patch('/:id', VerifyToken, async (req, res) => {
  const id = req.params.id 
  const userId = req.userId; 
  const body = req.body;

  try{ 
    const update = await prisma.post.update({
      where:{id:id, userId:userId}, 
      data:{ 
        
        ...body.postData,  
        
        postDetail:{
          update:{
            ...body.postDetail,
          }
        }
      }

    }) 
    res.status(200).json(update); 

  }catch(e){
    console.log("update_api", e); 
    res.status(500).json({message:"Internal Server Error"})
  }
})
router.delete('/:id', VerifyToken, async(req, res)=>{
  const id  = req.params.id; 
  const tokenuserid  = req.userId; 

  try{ 
    const deletepost = await prisma.post.delete({where:{id:id, userId:tokenuserid}}); 
    res.status(200).json({message:"Deleted successfully"});

  }catch(e){
    console.log("delete_api", e); 
    res.status(500).json({message:"Internal Server Error"});
  }
})

export default router;