const express = require("express");
const router = express.Router();
const Users = require("../models/user");
const Friend = require("../models/insideUser");
const mongoose = require("mongoose");

router.post("/", async (req, res) => {
    console.log(req.body);
    const { email, sender, senderUsername } = req.body;
    const rest = await Users.findOne({ email: email });

    if (rest) {
        const collec = email + "s";
        const FriendModel = mongoose.model(collec, Friend, collec);
        const rest2 = await FriendModel.findOne({ email: sender });
        if(!rest2){
        const newUser = new FriendModel({
            "email": sender,
            "username": senderUsername,
            "status": "pending"
        });

        await newUser.save();
        console.log("New User", newUser);
    }
    }

    console.log("Result", rest);
    res.send("okay");
});

router.post("/updateFriendStatus", async (req, res) => {
    console.log(req.body);
    console.log("I am here");
    const { email, sender,senderUsername, status } = req.body;
    const rest = await Users.findOne({ email: sender });
    const inThatOneToo = await Users.findOne({ email: email });

    try{if (rest) {
        const collec = email + "s";
        const collecs = sender + "s";
        const FriendModel = mongoose.model(collecs, Friend, collecs);
        const EarlierFriendModel = mongoose.model(collec, Friend, collec);

        if (status) {
           
            const updatedUser = await FriendModel.findOneAndUpdate(
                { email: email }, 
                { "status": "accepted" },
                { new: true }
            );
            const newUser = new EarlierFriendModel({
                "email": sender,
                "username": senderUsername,
                "status": "accepted"
            });
    
            await newUser.save();
            console.log("Updated User", updatedUser);
            console.log("This is correcly called");
            
        } else {
           
            await FriendModel.findOneAndDelete({ email: sender });
            console.log("User deleted due to false status");
        }}
        
        console.log("Friend status updated successfully");
    }catch(e){
        console.log("Error  in add Freiend");
        
    }

    console.log("Result", rest);
    res.send("okay");
});

router.get("/", (req, res) => {
    res.send("hello");
});

module.exports = router;
