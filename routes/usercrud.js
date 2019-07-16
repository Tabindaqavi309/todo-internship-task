const express = require('express');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bodyParser = require("body-parser");
const Profile = require('../model/Profile.js');
router.use(bodyParser.json());
const token = require('./token.js');
router.post('/signup', async (req, res) => {
    try {
        const {
            firstname,
            lastname,
            username,
            email,
            age,
            password
        } = req.body;

        const createdUser = await Profile.create({
            firstName: firstname,
            lastName: lastname,
            userName: username,
            email: email,
            age: age,
            password: password
        })
        return res.send(createdUser);
    }
    catch (err) {
        console.log(err)
        return res.status(400).send({
            Status: "Error Caught!!",
            message: "The error is: ",
            Error: err
        })

    }
})
router.post('/login', async (req, res) => {

    const {
        username,
        password
    } = req.body;
    try {
        let user = await Profile.findOne({ userName: username }, async (err, doc) => {
            
            if (err) {
                return res.json({
                    message: err
                })
            }
            if (!doc) {
                return res.json({
                    message: "Incorrect Username",
                });
            }

            bcrypt.compare(password, doc.password, function (err, isMatched) {
                if (err) {

                    return res.json({
                        message: err
                    })
                }
                if (!isMatched) {

                    return res.json({
                        message: "Incorrect Password",
                    });
                }
                if (isMatched) {

                    jwt.sign({ user: doc._id }, 'secretkey', (err, token) => {
                        if (err) {
                            return res.status(403).json({
                                err: err
                            })
                        }
                        return res.json({
                            message: "Successfully LOGIN",
                            profile: doc.toWeb(),
                            token: token
                        });
                    })

                }
            })


        })


    }
    catch (err) {
        return res.status(400).send({
            Status: "Error Caught!!",
            message: "The error is: ",
            Error: err
        })

    }
})
router.get('/', token, (req, res) => {
    try {
        return res.send(req._user.toWeb());
    }
    catch (err) {
        return res.status(400).send({
            Status: "Error Caught!!",
            message: "The error is: ",
            Error: err
        })
    }
})
//Format of token 
//Authorization : Bearer <access_token>












module.exports = router;