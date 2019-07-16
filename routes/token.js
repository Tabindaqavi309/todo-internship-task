
const express = require('express');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bodyParser = require("body-parser");
const Profile = require('../model/Profile.js');
router.use(bodyParser.json())

const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization']
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        jwt.verify(bearerToken, 'secretkey', async (err, authData) => {
            if (err) {
                return res.status(400).json({
                    message: "Wrong Token!!",
                    error: err
                })
            }
            else {

                req._user = await Profile.findOne({
                    _id: authData.user
                });

                next();
            }
        })
    }
    else {
        return res.status(400).json(
            {
                message: "No Token"
            }
        );
    }
}
module.exports = function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        jwt.verify(bearerToken, 'secretkey', async (err, authData) => {
            if (err) {
                return res.status(400).json({
                    message: "Wrong Token!!",
                    error: err
                })
            }
            else {

                req._user = await Profile.findOne({
                    _id: authData.user
                });

                next();
            }
        })
    }
    else {
        return res.status(400).json(
            {
                message: "No Token"
            }
        );
    }
} 