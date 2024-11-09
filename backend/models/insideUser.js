const mongoose   = require("mongoose")
const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    status:{
        type: String,
        required: true,
      default : "Pending"
    }
})
// module.exports = mongoose.model("Users",userSchema)
module.exports  = userSchema;