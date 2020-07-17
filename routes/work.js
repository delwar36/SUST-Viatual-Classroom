const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Task = require('../models/Task');
const Join = require('../models/Join');
const File = require('../models/Files');
const fs = require('fs');

const {ensureAuthenticated} = require('../configuration/auth');
const {forwardAuthenticated} = require('../configuration/auth');

router.get('/showclasswork/:id', ensureAuthenticated, (request, response) => {
    let linkStream = '/showclass/' + request.params.id;
    let linkClassMates = '/showclassmates/' + request.params.id;
    let path_clone = '/showclasswork/' + request.params.id;
    let showGrade = '/showclassgrade/' + request.params.id;
    const request_path = (request.path);

    File.find({
        classID: request.params.id,
        select: "1"
    }, (error, result) => {
        if (error) {
            console.log(error);
        } else {
            response.render('class-work', {
                linkStream,
                linkClassMates,
                path_clone,
                result,
                showGrade,
                path: request_path,
                user: request.user,
                li: 'showclass'
            });
        }
    }).sort({
        _id: -1
    });
});

router.get('/joinedclasswork/:id', ensureAuthenticated, (request, response) => {
    let linkStream = '/joined/' + request.params.id;
    let linkClassMates = '/joinedclassmates/' + request.params.id;
    let path_clone = '/joinedclasswork/' + request.params.id;
    let showGrade = '/showclassgrade/' + request.params.id;
    const request_path = (request.path);
    File.find({
        classID: request.params.id,
        select: "1"
    }, (error, result) => {
        if (error) {
            console.log(error);
        } else {
            response.render('class-work', {
                linkStream,
                linkClassMates,
                path_clone,
                result,
                showGrade,
                path: request_path,
                user: request.user,
            });
        }
    }).sort({
        _id: -1
    });
});


router.get('/showclassmates/:id', ensureAuthenticated, (request, response) => {
    const request_path = (request.path);
    let classID = request.params.id;

    let linkStream = '/showclass/' + request.params.id;
    let linkClassWork = '/showclasswork/' + request.params.id;
    let path_clone = '/showclassmates/' + request.params.id;
    let showGrade = '/showclassgrade/' + request.params.id;
    let errors = [];
    Join.find({
        join: classID
    }, (error, joinResult) => {
        if (error) {
            errors.push({
                message: error
            });
            response.render('class-mates', {
                errors,
                user: request.user,
                request_path
            });
        } else {
            User.find({}, (error, classUser) => {
                if (error) {
                    errors.push({
                        message: error
                    });
                    response.render('class-mates', {
                        errors,
                        user: request.user,
                        request_path
                    });
                } else {
                    response.render('class-mates', {
                        joinResult,
                        classUser,
                        linkStream,
                        linkClassWork,
                        path_clone,
                        path: request_path,
                        user: request.user,
                        showGrade,
                       
                    })
                }
            }).sort({
                _id: -1
            })
        }
    });
});

router.get('/joinedclassmates/:id', ensureAuthenticated, (request, response) => {
    const request_path = (request.path);
    let classID = request.params.id;

    let linkStream = '/joined/' + request.params.id;
    let linkClassWork = '/joinedclasswork/' + request.params.id;
    let path_clone = '/joinedclassmates/' + request.params.id;
    let showGrade = '/joinedclassgrade/' + request.params.id;
    let errors = [];

    Join.find({
        join: classID
    }, (error, joinResult) => {
        if (error) {
            errors.push({
                message: error
            });
            response.render('class-mates', {
                errors,
                user: request.user,
                request_path
            });
        } else {
            User.find({}, (error, classUser) => {
                if (error) {
                    errors.push({
                        message: error
                    });
                    response.render('class-mates', {
                        errors,
                        user: request.user,
                        request_path
                    });
                } else {
                    response.render('class-mates', {
                        joinResult,
                        classUser,
                        linkStream,
                        linkClassWork,
                        path_clone,
                        path: request_path,
                        user: request.user,
                        showGrade,
                       
                    })
                }
            }).sort({
                _id: -1
            });
        }
    });
});
module.exports = router;