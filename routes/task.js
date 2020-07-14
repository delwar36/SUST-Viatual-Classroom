const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Join = require('../models/Join');
const User = require('../models/User');
const nodeMailer = require('nodemailer');
require('dotenv/config');

let smtpTransport = nodeMailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

let mailOptions;


const {ensureAuthenticated} = require('../configuration/auth');
const {forwardAuthenticated} = require('../configuration/auth');

router.post('/newclasscreate', ensureAuthenticated, (request, response) => {
    const request_path = request.path;
    // Object destructuring
    const {classname, batch, topic} = request.body;
    let errors = [];
    // // Check required fields
    if (!classname || !batch || !topic) {
        errors.push({
            message: 'Please fill in all fields'
        });
    }

    if (errors.length > 0) {
        response.render('classes', {
            errors,
            classname,
            batch,
            topic,
            path: request_path,
            user: request.user
        });
    } else {
        let code = makeRandomCode(7);
        const newTask = new Task({
            classname,
            batch,
            topic,
            owner: request.user._id,
            class_code: code
        });
        User.findOneAndUpdate({
            _id: request.user
        }, {
            isClassCreator: true
        }, {new: true}, (error, user) => {
            if (error) {
                console.log(error);
            } else {
                newTask.save().then(result => {
                    request.flash('success_message', 'Your class created successfully..');
                    response.redirect('/dashboard-classes');
                });
            }
        });

    }
});

router.post('/announcements/:id', ensureAuthenticated, (request, response) => {

    let class_id = request.params.id;
    let announce = request.body.announce;
    if (announce != null) {
        Join.find({
            join: class_id
        }, (error, joinedUser) => {
            if (error) {
                console.log(error);
            } else {
                User.find({}, (error, user) => {
                    if (error) {
                        console.log(error)
                    } else {
                        let emailArray = [];
                        joinedUser.forEach(joinedUser => {
                            let joinedUserId = joinedUser.joiner.toString();
                            user.forEach(user => {
                                let userId = user._id.toString();
                                if (joinedUserId === userId) {
                                    emailArray.push(user.email);
                                }
                            });
                        });
                        console.log(announce);
                        let link = announce + "<br>" + '<img width=src="https://images.all-free-download.com/images/graphiclarge/balloons_banner_311344.jpg">';
                        mailOptions = {
                            to: emailArray,
                            subject: "New class announcements from " + request.user.name,
                            html: link
                        };
                        // console.log(mailOptions);
                        smtpTransport.sendMail(mailOptions, function (error, response) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log("Message sent: " + response.message);
                            }
                        });
                        request.flash('success_message', 'Your class announcements send successfully...');
                        response.redirect(`/showclass/${class_id}`);
                    }
                });
            }
        });
    } else {
        request.flash('error_message', 'Your class announcements do not send..');
        response.redirect(`/showclass/${class_id}`);
    }
});

function makeRandomCode(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


module.exports = router;