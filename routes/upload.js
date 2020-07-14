const express = require('express');
const router = express.Router();
const Comment = require('../models/Comments');
const File = require('../models/Files');
const path = require('path');
const fs = require('fs');

const {ensureAuthenticated} = require('../configuration/auth');
const {forwardAuthenticated} = require('../configuration/auth');

router.get('/uploadmaterials/:id', ensureAuthenticated, (request, response) => {
    const request_path = (request.path);
    response.render('upload-materials', {
        user: request.user,
        path: request_path,
        task: request.params.id
    });

});

router.get('/updateclassmaterials/:id', ensureAuthenticated, (request, response) => {
    const request_path = (request.path);
    let path_clone = 'material';
    File.findOne({
        _id: request.params.id
    }, (error, result) => {
        if (error) {
            console.log(error);
        } else {
            response.render('class-materials-update', {
                user: request.user,
                path: request_path,
                result,
                path_clone,
                task: request.params.id
            });
        }
    });
});

router.get('/updateclassassignment/:id', ensureAuthenticated, (request, response) => {
    const request_path = (request.path);
    let path_clone = 'assignment';
    File.findOne({
        _id: request.params.id
    }, (error, result) => {
        if (error) {
            console.log(error);
        } else {
            response.render('class-materials-update', {
                user: request.user,
                path: request_path,
                result,
                path_clone,
                task: request.params.id
            });
        }
    });
});
router.post('/classmaterialsupdate/:id', ensureAuthenticated, (request, response) => {
    const request_path = (request.path);
    let errors = [];
    File.findOneAndUpdate({_id: request.params.id,}, {
            topic: request.body.topic,
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
                response.render('password-update', {
                    errors,
                    user: request.user,
                    path: request_path
                });
            } else {
                console.log(value);
                request.flash('success_message', 'Successfully updated..');
                response.redirect(`/showclass/${value.classID}`)
            }
        });
});

router.post('/classassignmentsupdate/:id', ensureAuthenticated, (request, response) => {
    const request_path = (request.path);
    let errors = [];
    File.findOneAndUpdate({_id: request.params.id,}, {
            topic: request.body.topic,
            Due: request.body.duetime,
            date: request.body.due
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
                response.render('password-update', {
                    errors,
                    user: request.user,
                    path: request_path
                });
            } else {
                console.log(value);
                request.flash('success_message', 'Successfully updated..');
                response.redirect(`/showclass/${value.classID}`)
            }
        });
});

module.exports = router;

