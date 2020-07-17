const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');
const File = require('../models/Files');
const Comment = require('../models/Comments');

const {ensureAuthenticated} = require('../configuration/auth');

router.get('/showclass/:id', ensureAuthenticated, (request, response) => {
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
                            User.find({}, (error, allUser) => {
                                let batchArray = [];
                                let currentDate = new Date().getFullYear();
                                let mostPreviousBatch = new Date().getFullYear() - 5;
                                for (let i = mostPreviousBatch; i < currentDate; i++) {
                                    batchArray.push(i);
                                }
                                batchArray = batchArray.reverse();
                                if (error) {
                                    console.log(error)
                                } else {
                                    // response.send(task);
                                    let str = request_path.split('/');
                                    let path_clone = str[1];
                                    console.log(path_clone)
                                    response.render('class-materials', {
                                        user: request.user,
                                        path: request_path,
                                        path_clone,
                                        result,
                                        file,
                                        allUser,
                                        batchArray,
                                        taskComment
                                    });
                                }
                            })
                        }
                    })
                }
            }).sort({
                _id: -1,
            });
        }
    });
});


module.exports = router;