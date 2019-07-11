const express = require('express');
const app = express();
const mongoose = require("mongoose");
const db = require('../db');
const bodyParser = require("body-parser");
//const morgan = require("morgan");
const queryString = require('query-string');
require('../model/Post.js')
require('../db')
app.use(bodyParser.json())
app.use('/apidoc', express.static('apidoc'))

//.use(morgan());
const Post = mongoose.model("POST")

/**
 * @api {get} / It shows a message 
 * @apiGroup Main
 * @apiSuccess {String} message Success
 */

app.get('/', (req, res) => {
    return res.status(200).send({
        message: "Welcome to MongoDB with mongoose"
    })
})
/**
 * @api {get} /todos It shows you all the todos that you have created 
 * @apiGroup Todos
 * @apiSuccess {Number} _id Todo id
 * @apiSuccess {String} name Todo name
 * @apiSuccess {Date} date todo's date
 * @apiSuccess {String} priority Todo priority
 * @apiSampleRequest https://todo-application-tabinda.herokuapp.com/todos?name=abc&from=mm/dd/yyyy&to=mm/dd/yyyy
 

 * @apiSuccessExample {json} Success-Response:         
 * [{
 *   "_id" : 54abcfsfsrfhfe566b,
 *   "name" : "abc",
 *   "priority":"high",
 *   "date": yyyy-mm-dd 
 *  }]  
 * @apiErrorExample {json} List error
 *    HTTP/1.1 500 Internal Server Error                   
 */

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
/**
 * @api {get} /todos/:id Find a todo a/c to id
 * @apiGroup Todos
 * @apiParam {_id} id todo id
 * @apiSuccess {Number} _id Todo id
 * @apiSuccess {String} name Todo name
 * @apiSuccess {Date} date todo's date
 * @apiSuccess {String} priority Todo priority
 * @apiSampleRequest https://todo-application-tabinda.herokuapp.com/todos/5d24290b50d20b13a09d3f5b
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    { "_id" : 54abcfsfsrfhfe566b,
 *      "name" : "abc",
   *    "priority":"high",
   *    "date": yyyy-mm-dd|00... 
 *    }
 * @apiErrorExample {json} Todo Wrong Id
 *    HTTP/1.1 404 Not Found
 * @apiErrorExample {json} Find error
 *    HTTP/1.1 400 Internal Server Error
 */
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
/**
 * @api {post} /todos Insert todos
 * @apiGroup Todos
 * @apiParam {Object[]} todo name priority date
 * @apiParamExample {json} Input
 *    {
 *     "name" : "abc",
 *     "priority":"high",
 *    "date": mm/dd/yyyy
 *    }
 * @apiSuccess {Number} _id Todo id
 * @apiSuccess {String} name Todo name
 * @apiSuccess {String} priority Todo priority
 * @apiSuccess {Date}   date todo date
 * @apiSampleRequest https://todo-application-tabinda.herokuapp.com/todos
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    {
 *      "_id": 54abcfsfsrfhfe566b,
 *      "priority": "high",
 *       "date": yyyy/mm/dd|00...
 *    }
 * @apiErrorExample {json} Register error
 *    HTTP/1.1 400 Internal Server Error
 */

app.post('/todos', async (req, res) => {
    const post = new Post;
    try {
        //console.log(new Date(req.body.date));

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
/**
 * @api {put} /todos Update a todo
 * @apiGroup Todos
 * @apiParam {id} id Todo id
 * @apiParam {String} name Todo name
 * @apiParam {String} priority todo priority
 * @apiParamExample {json} Input
 *    {
 *       "name" : "abc",
 *     "priority":"high",
 *     "date": mm/dd/yyyy
 *    }
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 204 No Content
 * @apiErrorExample {json} Update error
 *    HTTP/1.1 400 Internal Server Error
 * @apiSampleRequest https://todo-application-tabinda.herokuapp.com/todos?name=abc
 * @apiSampleRequest https://todo-application-tabinda.herokuapp.com/todos?priority=high
 */
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
/**
 * @api {put} /todos/:id Update a todo a/c to id
 * @apiGroup Todos
 * @apiParam {id} id Todo id
 * @apiParam {String} name Todo name
 * @apiParam {String} priority todo priority
 * @apiParamExample {json} Input
 *    {
 *       "name" : "abc",
 *     "priority":"high",
 *     "date": mm/dd/yyyy
 *    }
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 204 No Content
 * @apiErrorExample {json} Update error
 *    HTTP/1.1 400 Internal Server Error
 * @apiSampleRequest https://todo-application-tabinda.herokuapp.com/todos/5d24290b50d20b13a09d3f5b
 */
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
/** 
 * @api {delete} /todos/:id Remove a todo
 * @apiGroup Todos
 * @apiParam {id} _id Todos id
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 204 No Content
 * @apiErrorExample {json} Delete error
 *    HTTP/1.1 400 Internal Server Error
 */
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