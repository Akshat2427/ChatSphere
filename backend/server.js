const express = require("express");
const app = express();
require("dotenv").config();
const session = require("express-session");
const cors = require("cors");
const mongoose = require("mongoose");
const Chat = require("./models/chat");
const http = require("http").createServer(app);
const { GoogleGenerativeAI } = require("@google/generative-ai");


const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const socketIO = require("socket.io")(http, {   
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true,
    }
});

const userInfoRouter = require("./routes/userInfo");
const addFriend = require("./routes/addFriend");
const loginRouter = require("./routes/login");

const users = new Map(); 

app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(session({
    secret: "key that will sign cookie",
    resave: false,
    saveUninitialized: false,
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/login", loginRouter);
app.use("/userInfo", userInfoRouter);
app.use("/addFriend", addFriend);

app.get("/", (req, res) => {
    res.send("Hello World");
});

socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on('userConnected', (username) => {
        users.set(username, socket.id);
        console.log(`🙏 User ${username} connected with ID: ${socket.id}`);
    });

    socket.on('message', async (data) => {
        const { text, name, email, recipient } = data;
        const recipientSocketID = users.get(recipient);
        const newMessage = {
            time: Date.now().toString(),
            sendBy: email,
            msg: text
        };

        try {
            let chat = await Chat.findOne({ users: { $all: [email, recipient] } });
            if (chat) {
                chat.chat.push(newMessage);
                chat.markModified('chat');
            } else {
                chat = new Chat({
                    users: [email, recipient],
                    chat: [newMessage],
                    pending: []
                });
            }
            await chat.save();

            if (recipientSocketID) {
                socket.to(recipientSocketID).emit('messageResponse', {
                    text,
                    name,
                    id: `${socket.id}${Math.random()}`,
                    socketID: socket.id,
                });
            }
        } catch (err) {
            console.error('Error saving message:', err.message);
        }
    });

    socket.on('disconnect', () => {
        console.log('🔥: A user disconnected');
    });
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(e => console.error('MongoDB connection error:', e.message));

    app.post("/ai", async (req, res) => {
        const { text } = req.body;
    
        const prompt = `You are a helpful assistant. Answer the following question in detail:\n\n"${text}"`;
    
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
            const result = await model.generateContent([prompt]);
    
            const responseText = result?.response?.text?.() || "No response generated.";
            console.log("AI Response:", responseText);
            res.send({ response: responseText });
        } catch (err) {
            console.error("Error generating AI response:", err.message);
            res.status(500).send({ error: "Failed to generate AI response" });
        }
    });
    

http.listen(8080, () => {
    console.log(`Server listening on port 8080`);
});
