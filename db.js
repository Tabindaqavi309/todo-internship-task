const mongoose = require("mongoose");
const dbname = "crud_mongodb";
require("dotenv").config();
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOURI,
    { useNewUrlParser: true }
);
const connection = mongoose.connection;
connection.on('connected', () => {
    console.log("connected to db");
})