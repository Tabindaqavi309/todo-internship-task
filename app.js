const express = require('express');
const app = express();
const mongoose = require("mongoose");
const db = require('./db');
const bodyParser = require("body-parser");
//const morgan = require("morgan");
const queryString = require('query-string');
require('./model/Post.js')
require('./db')
app.use(bodyParser.json())
//.use(morgan());
const Post = mongoose.model("POST")
console.log(new Date(12 / 11 / 2019));
app.get('/', (req, res) => {
    return res.status(200).send({
        message: "Welcome to MongoDB with mongoose"
    })
})
app.get('/todos', async (req, res) => {

    let {
        name,
        from,
        to,
        priority,
    } = req.query;
    try {

        from = new Date(from);
        to = new Date(to);
        console.log(from)
        console.log(to)
        console.log(name)
        console.log(priority)
        name = req.query.name ? req.query.name : null;
        priority = req.query.priority ? req.query.priority : null;
        from = req.query.from ? req.query.from : null;
        to = req.query.to ? req.query.to : null;
        if (to == null && from == null) {
            if (name == null && priority == null) {
                const posts = await Post.find({});
                return res.send(posts);
            }
            else if (name != null && priority == null) {
                const posts = await Post.find({ name: new RegExp(name, 'i') });
                return res.send(posts);
            }
            else if (name == null && priority != null) {
                const posts = await Post.find({ priority: priority });
                return res.send(posts);
            }
            else {
                const posts = await Post.find({ name: new RegExp(name, 'i'), priority: priority });
                return res.send(posts);
            }
        }

        if (name != null & priority != null) {
            const posts = await Post.find({ name: new RegExp(name, 'i'), priority: priority, date: { $gt: from, $lt: to } });
            return res.send(posts);
        }
        else if (name != null && priority == null) {
            const posts = await Post.find({ name: new RegExp(name, 'i'), date: { $gt: from, $lt: to } });
            return res.send(posts);
        }
        else if (name == null && priority != null) {
            const posts = await Post.find({ priority: priority, date: { $gt: from, $lt: to } });
            return res.send(posts);
        }

        else {
            const posts = await Post.find({ date: { $gt: from, $lt: to } });
            return res.send(posts);
        }
    }


    catch (error) {
        return res.status(500).send({
            Status: "Error Caught!!",
            message: "The error is :",
            Error: error
        })
    }
})

app.get('/todos/:id', async (req, res) => {
    try {
        const posts = await Post.find({ _id: req.params.id });
        return res.send(posts);
    }
    catch (error) {
        return res.status(400).send({
            Status: "Error Caught!!",
            message: "The Id that you've entered is incorrect!! ",
            Error: error
        })
    }
})


app.post('/todos', async (req, res) => {
    const post = new Post;
    try {
        console.log(new Date(req.body.date));

        post.name = req.body.name;
        post.priority = req.body.priority;
        post.date = new Date(req.body.date);
        await post.save();
        return res.send(post);
    }
    catch (err) {
        return res.status(400).send({
            Status: "Error Caught!!",
            message: "The error is: ",
            Error: err
        })

    }
})
app.put('/todos', async (req, res) => {
    const query = req.query;

    console.log(query);
    console.log(query.name);
    try {

        if (query["_id"] != null) {
            const posts = await Post.findByIdAndUpdate({
                _id: query["_id"]
            }, req.body, {
                    new: true,
                    runValidators: true
                })
            return res.send(posts);
        }
        else if (query.name != null) {

            const posts = await Post.findOneAndUpdate({ name: new RegExp(req.query.name, 'i') }, { $set: { name: req.body.name, priority: req.body.priority, date: new Date(req.body.date) } }, {
                new: true,
                runValidators: true
            })
            return res.send(posts);
        }
        else if (query.priority != null) {
            const posts = await Post.findOneAndUpdate({
                priority: query.priority
            }, req.body, {
                    new: true,
                    runValidators: true
                })
            return res.send(posts);
        }


    }
    catch (err) {
        return res.status(400).send({
            Status: "Error Caught!!",
            message: "The error is: ",
            Error: err
        })
    }
})

app.put('/todos/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const posts = await Post.findByIdAndUpdate({
            _id: id
        }, req.body, {
                new: true,
                runValidators: true
            })
        return res.send(posts);
    }
    catch (err) {
        return res.status(400).send({
            Status: "Error Caught!!",
            message: "The error is: ",
            Error: err
        })
    }
})
app.delete('/todos/:id', async (req, res) => {

    const id = req.params.id;

    try {
        const posts = await Post.findByIdAndDelete({
            _id: id
        })
        return res.send(posts);
    }
    catch (err) {
        return res.status(400).send({
            Status: "Error Caught!!",
            message: "The Id that you've entered is incorrect!! ",
            Error: err
        })
    }
})
app.listen(process.env.PORT || 3000, () => {
    console.log("Listening to 3000");
})