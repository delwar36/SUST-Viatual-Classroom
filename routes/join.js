const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const Join = require('../models/Join');
const File = require('../models/Files');
const Comment = require('../models/Comments');
const time = require('../configuration/Time');

const {ensureAuthenticated} = require('../configuration/auth');

router.post('/joinclass', ensureAuthenticated, (request, response) => {

    let errors = [];
    const request_path = (request.path);
    const user = request.user;
    const classCode = request.body.classcode;

    Task.findOne({
        class_code: classCode
    }, (error, task) => {
        if (error) {
            errors.push({
                message: error
            });
            response.render('classes', {
                errors,
                user,
                request_path
            });
        } else {
            User.findOne({
                _id: task.owner
            }, (error, own) => {
                if (error) {
                    errors.push({
                        message: error
                    });
                    response.render('classes', {
                        errors,
                        user,
                        request_path
                    });
                } else {
                    const join = new Join({
                        classcode: classCode,
                        owner_name: own.name,
                        owner_profile_picture: own.profile_picture,
                        join: task.id,
                        joiner: request.user.id,
                        date:time.getTime()
                    });
                    join.save().then(result => {
                        response.redirect('/dashboard-classes');
                    }).catch(error => {
                        if (error) {
                            errors.push({
                                message: error
                            });
                            response.render('classes', {
                                errors,
                                user,
                                request_path
                            });
                        }
                    });
                }
            });
        }
    });
});

router.get('/joined/:id', ensureAuthenticated, (request, response) => {
    const request_path = (request.path);
    let errors = [];
    let id = request.params.id;
    Task.findOne({
        _id: id
    }, (error, result) => {
        if (error) {
            errors.push({
                message: error
            });
            response.render('class-materials', {
                errors,
                user: request.user,
                path: request_path
            });
        } else {
            File.find({
                classID: id
            }, (error, file) => {
                if (error) {
                    errors.push({
                        message: error
                    });
                    response.render('class-materials', {
                        errors,
                        user: request.user,
                        path: request_path
                    });
                } else {
                    Join.findOne({
                        join: id
                    }, (error, join) => {
                        if (error) {
                            errors.push({
                                message: error
                            });
                            response.render('class-materials', {
                                errors,
                                user: request.user,
                                path: request_path
                            });
                        } else {
                            Comment.find({
                                comment_task: id
                            }, (error, taskComment) => {
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
                                    //response.send(task);
                                    let str = request_path.split('/');
                                    let path_clone = str[1];
                                    response.render('class-materials', {
                                        user: request.user,
                                        path: request_path,
                                        path_clone,
                                        result,
                                        file,
                                        join,
                                        taskComment
                                    });
                                }
                            });
                        }
                    }).sort({
                        _id: -1
                    });

                }
            }).sort({
                _id: -1
            });
        }
    });
});


module.exports = router;