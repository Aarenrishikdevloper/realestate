import express from "express";
import bycrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import jwt from 'jsonwebtoken'
import 'dotenv/config'

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body; 
  
  try {
    const hassedpassword = await bycrypt.hash(password, 10);
    const user  = await prisma.user.findFirst({where: {username: username}}); 
    if(user){
        return res.status(404).json({message:"user already exists"})
    }
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hassedpassword,  
       
      },
    });
    res.status(201).json({ message: "User Created", user: newUser });
  } catch (e) {
    console.log("user_regisration error", e);
    res.status(500).json({ message: "Failed To create" });
  }
}); 

router.post('/login', async(req, res) => {
   const {username, password} = req.body;  
   try{ 
    const user  = await prisma.user.findUnique({where:{username}}); 
    if(!user) return res.status(404).json({message:"User not found"});  
    const ispasswordvalid  = bycrypt.compare(password, user.password); 

    if(!ispasswordvalid) return res.status(404).json({message:"Invalid Credential"}); 
    const age = 1000*60*60*24*7; 
    const token  =  jwt.sign({id: user.id},process.env.JWT_KEY,{expiresIn:age})  
    const userObject ={
       email:user.email, 
       username:user.username,  
       avatar:user.avatar,
       id:user.id,
    }
    res.cookie("token", token, {httpOnly:true, maxAge:age}).status(200).json(userObject);     


   }catch(e){ 
    console.log("login_api_error",e); 
    res.status(500).json({message:"Internal Server Error"});

   }
})

router.post('/logout', async(req,res)=>{
  res.clearCookie("token").status(200).json({message:"Logged Out"});
})
export default router;
