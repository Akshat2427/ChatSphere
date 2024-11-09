const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    users: {
        type: Array,
        default: []
    },
   
    chat:{
        type: Array,
        default: []

    },
    
    pending :{
        type: Array,
        default: []
    }
}, { collection: 'chats' }); 

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
