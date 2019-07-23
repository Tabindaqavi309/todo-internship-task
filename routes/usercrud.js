const express = require('express');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bodyParser = require("body-parser");
const Profile = require('../model/Profile.js');
router.use(bodyParser.json());
const token = require('./token.js');
require('dotenv').config()
const multer = require('multer');
const cloudinary = require('cloudinary');
const helper = require('sendgrid').mail;
const async = require('async');
function sendEmail(
    parentCallback,
    fromEmail,
    toEmails,
    subject,
    textContent,
    htmlContent
  ) {
    const errorEmails = [];
    const successfulEmails = [];
     const sg = require('sendgrid')('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');
     async.parallel([
      function(callback) {
        // Add to emails
        for (let i = 0; i < toEmails.length; i += 1) {
          // Add from emails
          const senderEmail = new helper.Email(fromEmail);
          // Add to email
          const toEmail = new helper.Email(toEmails[i]);
          // HTML Content
          const content = new helper.Content('text/html', htmlContent);
          const mail = new helper.Mail(senderEmail, subject, toEmail, content);
          var request = sg.emptyRequest({
            method: 'POST',
            path: '/v3/mail/send',
            body: mail.toJSON()
          });
          sg.API(request, function (error, response) {
            console.log('SendGrid');
            if (error) {
              console.log('Error response received');
            }
            console.log(response.statusCode);
            console.log(response.body);
            console.log(response.headers);
          });
        }
        // return
        callback(null, true);
      }
    ], function(err, results) {
      console.log('Done');
    });
    parentCallback(null,
      {
        successfulEmails: successfulEmails,
        errorEmails: errorEmails,
      }
    );
}
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_ID,
    api_secret: process.env.API_SECRET

})
const upload = multer({ storage: multer.diskStorage({}), dest: 'uploads/' });
/**
 * @api {post} /signup for user Signup
 * @apiGroup User SIGNUP
 * @apiParam {Object[]} information firstname,lastname,username,age,email,password
 * @apiParamExample {json} Input
 *    {
 *     	"firstname":"Tabinda",
 *       "lastname" : "Qavi",
 *        "username": "tabinda-qavi",
 *         "age":20,
 *      "email":"tabindaqavi@gmail.com",
 *       "password":"abcetc"
 *    }
 *
 * @apiSuccess {String} firstname 
 * @apiSuccess {String} lastname
 * @apiSuccess {String} username  
 * @apiSuccess {email} email
 * @apiSuccess {Number} age
 * @apiSuccess {String} password
 * @apiSampleRequest https://todo-application-tabinda.herokuapp.com/profile/signup
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *   {
    "_id": "5d2dac1149c70428eccb2b0a",
    "firstName": "urwa",
    "lastName": "sultana",
    "userName": "xyz",
    "email": "urwasultana@gmail.com",
    "age": 20,
 * }
 * @apiErrorExample {json} Register error
 *    HTTP/1.1 400 Internal Server Error
 */
router.post('/signup', async (req, res) => {
    const {
        firstname,
        lastname,
        username,
        email,
        age,
        password
    } = req.body;
    async.parallel([
        function (callback) {
          sendEmail(
            callback,
            'tabindaqavi@todoapp.com',
            [email],
            'TODO APP',
            'Text Content',
            '<p style="font-size: 32px;">THANK YOU FOR SIGNING UP</p>'
          );
        }
      ])
      try {
      

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
/**
 * @api {post} /login for user log in
 * @apiGroup User LOGIN
 * @apiParam {Object[]} keys username,password
 * @apiParamExample {json} Input
 *    {
 *        "username": "tabinda-qavi",
 *       "password":"abcetc"
 *    }
 *@apiSuccess {String} message Successfully LOGGEDIN
 * @apiSuccess {String} firstname 
 * @apiSuccess {String} lastname
 * @apiSuccess {String} username  
 * @apiSuccess {email} email
 * @apiSuccess {Number} age
 * @apiSuccess {String} password
 * @apiSampleRequest https://todo-application-tabinda.herokuapp.com/profile/login
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 * {
    "message": "Successfully LOGIN",
    "profile": {
        "firstName": "tabinda",
        "lastName": "qavi",
        "userName": "tabinda-qavi",
        "age": 21,
        "email": "tabindaqavi@gmail.com"
    },
    "token": "4IiwiaWF0IjoxNTYzMjY1Mjg5fQ.ZKdduJHDpGT4wbLz8kO52yurOXwyXkhIOuhly6hp7iI"
}
 * @apiErrorExample {json} Register error
 *    HTTP/1.1 400 Internal Server Error
 */
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
/**
 * @api {get} /profile It shows the profile of the user currently logged in
 * @apiGroup Profile Info
 * *@apiSuccess {String} message Successfully LOGGEDIN
 * @apiSuccess {String} firstname 
 * @apiSuccess {String} lastname
 * @apiSuccess {String} username  
 * @apiSuccess {email} email
 * @apiSuccess {Number} age
 * @apiSampleRequest https://todo-application-tabinda.herokuapp.com/profile
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 * {
      {
        "firstName": "tabinda",
        "lastName": "qavi",
        "userName": "tabinda-qavi",
        "age": 20,
        "email": "tabindaqavi@gmail.com"
    }
}
 * @apiErrorExample {json} Register error
 *    HTTP/1.1 400 Internal Server Error
*/


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
router.post('/uploadprofilepicture', token, upload.single('profile'), async (req, res) => {
    try {


        const result = await cloudinary.v2.uploader.upload(req.file.path);
        //console.log(result.secure_url);
        const user = await Profile.findOneAndUpdate({ _id: req._user._id }, { $set: { profilePic: result.secure_url } }, (err, doc) => {
            if (err) {
                console.log(err)
            }
            else {
                console.log(doc.profilePic);
            }
        })

        return res.send(user);
    } catch (err) {
        return res.json(
            {
                ERROR: err
            }
        );
    }
});

module.exports = router;