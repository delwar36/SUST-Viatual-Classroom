const express = require('express');
const router = express.Router();
const Comment = require('../models/Comments');
const File = require('../models/Files');
const Task = require('../models/Task');
const Join = require('../models/Join');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodeMailer = require('nodemailer');
const time = require('../configuration/Time');
require('dotenv/config');


const {ensureAuthenticated} = require('../configuration/auth');
const {forwardAuthenticated} = require('../configuration/auth');

let smtpTransport = nodeMailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

let mailOptions;

// multer storage var
let storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function (request, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        //  callback(null, file.originalname);
    }
});

let upload = multer({
    storage: storage
});

router.get('/uploadmaterials/:id', ensureAuthenticated, (request, response) => {

    const request_path = (request.path);
    response.render('upload-materials', {
        user: request.user,
        path: request_path,
        task: request.params.id
    });

});

function getRealTime(day, month, year) {
    const monthNamesAll = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    return day + ' ' + monthNamesAll[month - 1].substr(0, 3) + ',' + year;
}


router.post('/classmaterialsupload/:id', ensureAuthenticated, upload.array('class_files', 12), (request, response, next) => {
    const request_path = (request.path);

    let class_id = request.params.id;
    let select = request.body.select;
    let topic = request.body.topic;
    let due = request.body.due;
    let date = due.split('-');
    let dueDate = '';
    if (select === '1'){
        dueDate = getRealTime(date[2], parseInt(date[1]), date[0]);
    }
    let dueTime = request.body.duetime;
    let assignmentTopic = request.body.assignmentTopic;

    let errors = [];
    const fileUpload = new File({
        select: select,
        topic: topic,
        isPinned: false,
        classID: class_id,
        owner: request.user.id,
        files: request.files,
        Due: dueDate + " | " + dueTime,
        date: time.getTime(),
        assignmentTopic: assignmentTopic
    });

    fileUpload.save().then(result => {
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
                        let str = "Please go your class room and keep up to date";
                        let link = str + "<br>" + '<p><a href="http://localhost:8888/joined/' + class_id + '">Go to your class</a></p>';
                        mailOptions = {
                            to: emailArray,
                            subject: select === "0" ? "New Class Materials uploaded." : "New Class Assignment uploaded.",
                            html: link
                        };
                        // console.log(mailOptions);
                        smtpTransport.sendMail(mailOptions, function (error, response) {
                            if (error) {
                                console.log(error);
                                // res.end("error");
                            } else {
                                console.log("Message sent: " + response.message);
                                // res.end("sent");
                            }
                        });
                        request.flash('success_message', 'Your class materials/assignment created successfully...');
                        response.redirect(`/showclass/${class_id}`);
                    }
                });
            }
        });
    }).catch(error => {
        if (error) {
            errors.push({
                message: error
            });
        }
        response.render('class-materials', {
            errors,
            user: request.user,
            path: request_path
        });
    });

});

router.post('/sendcode/:id', ensureAuthenticated, (request, response) => {
    const request_path = (request.path);
    const emails = request.body.emails;
    const messageBody = request.body.messageBody;

    Task.findOne({
        _id: request.params.id
    }, (error, result) => {
        if (error) {
            console.log(error);
        } else {
            console.log(result);
            mailOptions = {
                to: emails,
                subject: result.classname,
                html: "Hello,I am " + "<strong>" + request.user.name + "</strong>" + ".You are requested to join the " + "<h3>" + result.classname + " **Class Code** : " + "<strong>" + result.class_code + "</strong>" + "</h3>" + "<br>" + "<p>" + messageBody + "</p>" + "<br>" + "If have any question contact with me : " + "<br>" + "<strong>" + request.user.email + "</strong>"
            };
            //console.log(mailOptions);
            smtpTransport.sendMail(mailOptions, function (error, response) {
                if (error) {
                    console.log(error);
                    // res.end("error");
                } else {
                    console.log("Message sent: " + response.message);
                    // res.end("sent");
                }
            });
            request.flash('success_message', 'Send code successfully..');
            response.redirect(`/showclass/${request.params.id}`);
        }

    })
});
//

router.get('/deletematerials/:deleteid/:classid', ensureAuthenticated, (request, response) => {
    let deleteID = request.params.deleteid;
    let classID = request.params.classid;

    File.findOneAndDelete({
        _id: deleteID
    }, (error, result) => {
        if (error) {
            console.log(error)
        } else {
            if (result.select === '0') {
                result.files.forEach(file => {
                    fs.unlinkSync(`./public/uploads/${file.filename}`);
                });
            }
            Comment.find({
                comment_post: deleteID
            }, (error, commentPost) => {
                if (error) {
                    console.log(error)
                } else {
                    commentPost.forEach(comment => {
                        Comment.findOneAndDelete({
                            comment_post: comment.comment_post
                        }, (error, res) => {
                            if (error) {
                                console.log(error);
                            }
                        });
                    })
                }
            });
            request.flash('success_message', 'Your class materials/assignment deleted successfully...');
            response.redirect(`/showclass/${classID}`);
        }
    });
});


router.get('/pinpostmaterials/:pinpostid/:classid', ensureAuthenticated, (request, response) => {
    let pinPostId = request.params.pinpostid;
    let classID = request.params.classid;

    console.log("Hello world");
    console.log(pinPostId + "  " + classID);
    const request_path = (request.path);
    let errors = [];
    File.findOneAndUpdate({_id: pinPostId, classID: classID, owner: request.user._id}, {
            isPinned: true,
        },
        {
            new: true
        }, (error, value) => {
            if (error) {
                errors.push({
                    message: error
                });
            }
            if (errors.length > 0) {
                response.render('class-materials', {
                    errors,
                    user: request.user,
                    path: request_path
                });
            } else {
                // console.log(value);
                request.flash('success_message', 'Pinned post successfully..');
                response.redirect(`/showclass/${classID}`)
            }
        });
});

router.get('/unpinpostmaterials/:pinpostid/:classid', ensureAuthenticated, (request, response) => {
    let pinPostId = request.params.pinpostid;
    let classID = request.params.classid;

    console.log(pinPostId + "  " + classID);
    const request_path = (request.path);
    let errors = [];
    File.findOneAndUpdate({
            _id: pinPostId,
            classID: classID,
            owner: request.user._id
        }, {
            isPinned: false,
        },
        {
            new: true
        }, (error, value) => {
            if (error) {
                errors.push({
                    message: error
                });
            }
            console.log(value);
            if (errors.length > 0) {
                response.render('class-materials', {
                    errors,
                    user: request.user,
                    path: request_path
                });
            } else {
                // console.log(value);
                request.flash('success_message', 'UnPinned post successfully..');
                response.redirect(`/showclass/${classID}`)
            }
        });
});

router.post('/postcomment/:pathclone/:postid/:classid', ensureAuthenticated, (request, response) => {
    let postID = request.params.postid;
    let classID = request.params.classid;
    let pathClone = request.params.pathclone;

    let errors = [];
    const request_path = (request.path);

    const comment = new Comment({
        comment: request.body.comment,
        comment_owner_name: request.user.name,
        comment_owner_profile_picture: request.user.profile_picture,
        comment_task: classID,
        date: time.getTime(),
        comment_post: postID
    });

    comment.save().then(result => {
        //console.log(pathClone);
        if (pathClone === 'showclass') {
            response.redirect(`/showclass/${classID}`);
        } else {
            response.redirect(`/joined/${classID}`);
        }

    }).catch(error => {
        if (error) {
            errors.push({
                message: error
            });
            response.render('class-materials', {
                errors,
                user: request.user,
                path: request_path
            });
        }
    });
});

module.exports = router;