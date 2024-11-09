const express = require("express")
const app = express()
const router = express.Router()
const Users = require("../models/user")

router.post("/",async (req,res)=>{
    const user = req.body
    console.log("const user",user);
    console.log("const req.body",req.body);
    req.session.user = user
    if(user.isLogin){
        console.log(" login.js 1");
const rest = await Users.findOne({email : user.email , password : user.password})
if(!rest){
    return res.json({ message: "Invalid credentials" });

}
console.log("rest",rest);
return res.status(200).json({ message: "okay" , rest });

    }
    else{
        console.log(" login.js 2");
        const rest = await Users.create({
            username : user.username,
            email : user.email,
            password : user.password,
            
        })
        console.log("new User" , rest);
        return res.status(200).json({ message: "okay" , rest });

    }
   
})
router.get("/info",(req,res)=>{console.log(req?.session?.user);
    res.send(JSON.stringify(req?.session?.user))
})
module.exports = router