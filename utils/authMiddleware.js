import usersData from "../usersDb.json" with {type:"json"}

const authMiddleware = (req,res,next)=>{
    const {userId} = req.cookies
    const userObj = usersData.find(user => user.id===userId)
    
 
    if(!userObj){
       return res.status(401).json({status:401,error:"Please Login to your account!"})
    }
    console.log("HELLLO FROM AUTHMIDDLEWARE");
    req.user = userObj
    next()

}




export default authMiddleware