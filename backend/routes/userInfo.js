const express = require("express");
const app = express();
const router = express.Router();
const mongoose = require("mongoose");
const userEmailSchema = require("../models/emailDataStorage");
const Chat = require("../models/chat");
// Middleware to parse JSON
app.use(express.json());

async function getCollectionData(collectionName) {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionExists = collections.some(collection => collection.name === collectionName);

    if (collectionExists) {
        const collection = db.collection(collectionName);
        const data = await collection.find({}).toArray();
        console.log("I am Before chat" , data);
        
        return { exists: true, data: data };
    } else {
        return { exists: false, data: null };
    }
}

router.post("/", async (req, res) => {
    console.log(req.body);
    const { email } = req.body;
    try {
        console.log(" userInfo.js 1");
        
        const result = await getCollectionData(email);
        if (result.exists) {
            res.json({ message: "Collection exists", data: result.data });
        } else {
            console.log(" userInfo.js 2");
            const UserModel = mongoose.model(email, userEmailSchema);
            const newUser = await UserModel.find({});
            console.log("newUser", newUser);
            res.json({ exists: true, data: newUser });
        }
    } catch (err) {
        console.error('Error checking collection existence', err);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.post("/getPreviousChat", async (req, res) => {
    const { email1, email2 } = req.body;

    try {
        const chats = await Chat.find({
            users: { $all: [email2, email1] }
        }).exec();

        if (chats.length > 0) {
            console.log("Chattttsss" , chats);
            
            res.json({ message: "Chats found", data: chats });
        } else {
            res.json({ message: "No chats found between the users" });
        }
    } catch (err) {
        console.error('Error fetching chats:', err);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;