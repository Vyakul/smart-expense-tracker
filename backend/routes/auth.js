const express = require('express');
const pool = require('../db');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const {z} = require('zod');
const router = express.Router();
const signupSchema =z.object({
    name:z.string().min(1).max(100),
    email:z.string().email(),
    password:z.string().min(8),
});
const loginSchema = z.object({
    email:z.string().email(),
    password:z.string().min(8),
});
router.post('/signup',async(req,res)=>{
    const parsedData=signupSchema.safeParse(req.body);
    if(!parsedData.success){
        return res.status(400).json({
            message:"Invalid input data",
        })
    }
    const {name,email,password} = parsedData.data;
    try{
        const existingUser=await pool.query('SELECT * FROM users WHERE email=$1',[email]);
        if(existingUser.rows.length>0){
            return res.status(400).json({
                message:"User already exists",
            })
        }
        const passwordHash=await bcrypt.hash(password,10);
        const result=await pool.query('INSERT INTO users (name,email,password_hash) values ($1,$2,$3) RETURNING id,name,email',[name,email,passwordHash]);
        res.status(201).json({
            message:"User created successfully",
            user:result.rows[0]
        });

    }
    catch(err){
        console.error(err.message);
        res.status(500).json({
            message:"Server error",
        })
    }
})
router.post('/login',async(req,res) =>{
    const pasedData=loginSchema.safeParse(req.body);
    if(!pasedData.success){
        return res.status(400).json({
            message:"Invalid input data",
        })
    }
    const {email,password}=pasedData.data;
    try{
        const user=await pool.query('SELECT * FROM users WHERE email=$1',[email]);
        if(user.rows.length===0){
            return res.status(400).json({
                message:"Invalid email",
            });
        }
        const vailidPassword= await bcrypt.compare(password,user.rows[0].password_hash);
        if(!vailidPassword){
            return res.status(400).json({
                message:"Invalid password",
            });
        }
        const token=jwt.sign({id:user.rows[0].id},process.env.JWT_SECRET,{expiresIn:'1h'});
        res.status(200).json({
            message:"Login successful",
            token:token,
        });
    }
    catch(err){
        console.error(err.message);
        res.status(500).json({
            message:"Server error",
        })
    }

})
module.exports=router;