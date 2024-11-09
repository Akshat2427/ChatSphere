const mongoose   = require("mongoose")
const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        require: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    }
})
module.exports = mongoose.model("Users",userSchema)