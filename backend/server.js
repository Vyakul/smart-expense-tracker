const express=require('express');
const pool=require('./db');
const app=express();
app.use(express.json());
app.get('/hello' ,async(req,res)=>{
    res.send('<h1>hello</h1>')
});
app.listen(5000,() =>{
    console.log("Server is running on Port Number 500")
});