const mongoose = require("mongoose");
post_schema = mongoose.Schema({
    name: {

        type: String,
        required: true
    },
    priority: {

        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    }



});
module.exports = mongoose.model("POST", post_schema);