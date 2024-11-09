const mongoose = require("mongoose")
const Str = mongoose.Schema({
    person:{
        type:String,
        required:true
    },
    chats:{
        type:Array,
       
    }
    
})

module.exports = Str