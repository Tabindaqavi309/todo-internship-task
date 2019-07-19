const express = require('express');
const app = express();
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const productRoutes = require('./usercrud.js');
const db = require('../db');
const bodyParser = require("body-parser");
//const morgan = require("morgan");
const queryString = require('query-string');
var multer = require('multer');
var upload = multer({dest:'uploads/'});
require('../model/Todos.js');
require('../model/Profile.js');
require('../db')
app.use(bodyParser.json())
app.use('/apidoc', express.static('apidoc'))
app.use('/profile', productRoutes);
const token = require('./token');
//.use(morgan());
const Todos = mongoose.model("Todos");
const Users = mongoose.model("Profile");

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

app.get('/todos', token, async (req, res) => {

    let {
        name,
        from,
        to,
        priority,
    } = req.query;
    try {

        const todosObj = await Todos.find({ UserId: req._user._id });
        if (todosObj != null) {

            from = new Date(from);
            to = new Date(to);
            name = req.query.name ? req.query.name : null;
            priority = req.query.priority ? req.query.priority : null;
            from = req.query.from ? req.query.from : null;
            to = req.query.to ? req.query.to : null;
            if (to == null && from == null) {
                if (name == null && priority == null) {


                    return res.send(todosObj);
                }
                else if (name != null && priority == null) {
                    const todosObj = await Todos.find({ UserId: req._user._id, name: new RegExp(name, 'i') }, (err, doc) => {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log(doc);
                        }
                    })

                    return res.send(todosObj);
                }
                else if (name == null && priority != null) {
                    const todosObj = await Todos.find({ UserId: req._user._id, priority: priority });
                    return res.send(todosObj);
                }
                else {
                    const todosObj = await Todos.find({ UserId: req._user._id, name: new RegExp(name, 'i'), priority: priority });
                    return res.send(todosObj);
                }
            }

            if (name != null & priority != null) {
                const todosObj = await Todos.find({ UserId: req._user._id, name: new RegExp(name, 'i'), priority: priority, date: { $gt: from, $lt: to } });
                return res.send(todosObj);
            }
            else if (name != null && priority == null) {
                const todosObj = await Todos.find({ UserId: req._user._id, name: new RegExp(name, 'i'), date: { $gt: from, $lt: to } });
                return res.send(todosObj);
            }
            else if (name == null && priority != null) {
                const todosObj = await Todos.find({ UserId: req._user._id, priority: priority, date: { $gt: from, $lt: to } });
                return res.send(todosObj);
            }

            else {
                const todosObj = await Todos.find({ UserId: req._user._id, date: { $gt: from, $lt: to } });
                return res.send(todosObj);
            }
        }
        else {
            return res.send({
                message: "This User have no todos"
            });
        }
    }



    catch (error) {
        return res.status(400).send({
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
app.get('/todos/:id', token, async (req, res) => {
    try {
        const todosObj = await Todos.findOne({ UserId: req._user._id, _id: req.params.id });
        if (todosObj)
            return res.send(todosObj);
        else {
            return res.status(400).send({
                Status: "Error Caught!!",
                message: "The Id that you've entered is incorrect!! ",
                Error: error
            })
    
        }
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
app.post('/profilepicture', upload.single('profile'), (req, res) => {
    try {
      res.send(req.file);
    }catch(err) {
      res.send(400);
    }
  });
app.post('/todos', token, async (req, res) => {
    const post = new Todos;
    try {

        post.name = req.body.name;
        post.priority = req.body.priority;
        post.priority = post.priority.toLowerCase();
        post.date = new Date(req.body.date);
        post.UserId = req._user._id;
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
app.put('/todos', token, async (req, res) => {
    const query = req.query;

    //console.log(query);
    // console.log(query.name);
    try {

        if (query["_id"] != null) {
            const todosObj = await Todos.findByIdAndUpdate({
                UserId: req._user._id, _id: query["_id"]
            }, req.body, {
                    new: true,
                    runValidators: true
                })
            return res.send(todosObj);
        }
        else if (query.name != null) {

            const todosObj = await Todos.findOneAndUpdate({ UserId: req._user._id, name: new RegExp(req.query.name, 'i') }, { $set: { name: req.body.name, priority: req.body.priority, date: new Date(req.body.date) } }, {
                new: true,
                runValidators: true
            })
            return res.send(todosObj);
        }
        else if (query.priority != null) {
            console.log(req.body);
            const todosObj = await Todos.findOneAndUpdate({
                UserId: req._user._id, priority: req.query.priority
            }, req.body);

            return res.send(todosObj);

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
app.put('/todos/:id', token, async (req, res) => {
    const id = req.params.id;

    try {
        const todosObj = await Todos.findByIdAndUpdate({
            UserId: req._user._id, _id: id
        }, req.body, {
                new: true,
                runValidators: true
            })
        return res.send(todosObj);
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
app.delete('/todos/:id', token, async (req, res) => {

    const id = req.params.id;

    try {
        const todosObj = await Todos.findByIdAndDelete({
            UserId: req._user._id, _id: id
        })
        return res.send(todosObj);
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