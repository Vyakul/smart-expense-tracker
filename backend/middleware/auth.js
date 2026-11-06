const jwt=require('jsonwebtoken');
function authenticateToken(req,res,next){
    const header=req.headers.authorization;
    if(!header || !header.startsWith('Bearer ')){
        return res.status(401).json({
            message:"No token provided"
        });
    }
    try{
        const token=header.split(' ')[1];
        const payload=jwt.verify(token,process.env.JWT_SECRET);
        req.user={id:payload.id};
        next();
    }
    catch(err){
        return res.status(401).json({
            message:"Invalid"
        });
    }
}
module.exports=authenticateToken;