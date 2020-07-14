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

router.get('/', forwardAuthenticated, (request, response) => {
    const request_path = (request.path);
    response.render('welcome', {
        path: request_path
    });
});

router.get('/userverification/:id', (request, response) => {

    response.render('verification', {
        path: '/verify',
        id: request.params.id,
    });
});
router.get('/about/ourclassroom', (request, response) => {
    const request_path = (request.path);
    response.render('about', {
        path: request_path
    });
});

router.get('/dashboard-classes', ensureAuthenticated, (request, response) => {
    const request_path = (request.path);
    let errors = [];
    Task.find({
        owner: request.user.id
    }, (error, task) => {
        if (error) {
            errors.push({
                message: error
            });
            response.render('classes', {
                errors,
                user: request.user,
                path: request_path
            });
        } else {
            Task.find({}, (error, joined_task) => {
                if (error) {
                    errors.push({
                        message: error
                    });
                    response.render('classes', {
                        errors,
                        user: request.user,
                        path: request_path
                    });
                } else {
                    Join.find({
                        joiner: request.user.id
                    }, (error, joined) => {
                        if (error) {
                            errors.push({
                                message: error
                            });
                            response.render('classes', {
                                errors,
                                user: request.user,
                                path: request_path
                            });
                        } else {
                            // response.json(joined);

                            response.render('classes', {
                                user: request.user,
                                path: request_path,
                                joined,
                                details: task,
                                joined_details: joined_task
                            });
                        }
                    });
                }
            });
        }
    });
});


router.get('/userupdateprofile', ensureAuthenticated, (request, response) => {
    const request_path = (request.path);
    response.render('update-profile', {
        user: request.user,
        path: request_path
    })
});


// Set The Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
        // cb(null, file.originalname);
    }
});

// Init Upload
const upload = multer({
    storage: storage,
    limits: {fileSize: 1000000},
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('profile');

function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images and Only!');
    }
}

router.post('/profileupdate/:id', ensureAuthenticated, (request, response) => {
    const request_path = (request.path);
    let errors = [];
    upload(request, response, (error) => {
        if (error) {
            errors.push({
                message: error.message
            });
            response.json(error);
        } else {
            if (request.file === undefined) {
                errors.push({
                    message: 'Error: No File Selected!'
                });
                if (errors.length > 0) {
                    response.render('update-profile', {
                        errors,
                        user: request.user,
                        path: request_path
                    });
                }
            } else {
                User.findOneAndUpdate({_id: request.params.id,}, {
                        profile_picture: request.file.filename
                    },
                    {
                        new: true
                    }, (error, result) => {
                        if (error) {
                            errors.push({
                                message: error
                            });
                        }
                        if (errors.length > 0) {
                            response.render('update-profile', {
                                errors,
                                user: request.user,
                                path: request_path
                            });
                        } else {
                            if (request.user.profile_picture) {
                                fs.unlinkSync(`./public/uploads/${request.user.profile_picture}`)
                            }
                            request.flash('success_message', 'You are updated profile successfully..');
                            response.redirect('/dashboard-classes')
                        }
                    });
            }
        }
    });
});


module.exports = router;