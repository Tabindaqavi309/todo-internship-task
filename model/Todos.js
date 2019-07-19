const mongoose = require("mongoose");
post_schema = mongoose.Schema({
    name: {

        type: String,
        required: true
    },
    priority: {

        type: String,
        required: true,
        lowercase: true
    },
    date: {
        type: Date,
        required: true
    },
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    }



});
module.exports = mongoose.model("Todos", post_schema);