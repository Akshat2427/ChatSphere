const express = require("express");
const app = express();
require('dotenv').config();
const session = require("express-session");
const cors = require("cors");
const mongoose = require("mongoose");
const Chat = require("./models/chat");
const http = require("http").createServer(app); 
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
                chat.pending.forEach(element => {
                    if (element.email === recipient) {
                        element.sended = newMessage.time;
                    }
                });
                chat.markModified('pending');
            } else {
                chat = new Chat({
                    users: [email, recipient],
                    chat: [newMessage],
                    pending: [
                        { email, recived: 1, sended: newMessage.time },
                        { email: recipient, recived: 1, sended: 1 }
                    ]
                });
            }

            await chat.save();
            console.log("Saved chat:", chat);

            if (recipientSocketID) {
                console.log("Sending message to:" + recipientSocketID + " go by name " + name);
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


http.listen(8080, () => {
    console.log(`Server listening on port 8080`);
});
