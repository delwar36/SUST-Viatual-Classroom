const express = require('express');
const router = express.Router();
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const nodeMailer = require('nodemailer');
const Cryptr = require('cryptr');
const time = require('../configuration/Time');
require('dotenv/config');

const {ensureAuthenticated} = require('../configuration/auth');
const {forwardAuthenticated} = require('../configuration/auth');

const cryptr = new Cryptr(process.env.MY_SECRET_PASSWORD);
// User Model
const User = require('../models/User');


let smtpTransport = nodeMailer.createTransport({
    service: "Gmail",   
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    }
});

let mailOptions;

// Register page
router.get('/register', (request, response) => {
    const request_path = (request.path);
    response.render('register', {
        path: request_path
    });
});


// Register handle
router.post('/sign-up', (request, response) => {
    const request_path = (request.path);
    // Object destructuring
    const {firstName, lastName, registration, email, password, confirm_password} = request.body;
    let errors = [];

    //  Check required fields
    if (!firstName || !lastName || !email || !password || !confirm_password) {
        errors.push({
            message: 'Please fill in all fields'
        });
    }

    // // Check password match
    if (password !== confirm_password) {
        errors.push({
            message: 'Password do not match'
        });
    }

    // // Check pass length
    if (password.length < 6) {
        errors.push({
            message: 'Password should be at least 6 characters'
        })
    }
    if (errors.length > 0) {
        response.render('register', {
            errors,
            registration,
            email,
            password,
            confirm_password,
            path: request_path
        });
    } else {
        // Validation Passed
        User.findOne({
            email: email
        }).then(user => {
                if (user) {
                    // User Exists
                    errors.push({
                        message: 'Email already exists..'
                    });
                    response.render('register', {
                        errors,
                        registration,
                        email,
                        password,
                        confirm_password,
                        path: request_path
                    });
                } else {
                    let token = generateOTP();
                    // hash password
                    let hashPassword = '';
                    try {
                        hashPassword = cryptr.encrypt(password);
                    } catch (error) {
                        console.log(error);
                    }
                    const newUser = new User({
                        name: firstName + ' ' + lastName,
                        registration,
                        email,
                        password: hashPassword,
                        profile_picture: null,
                        isVerified: false,
                        isClassCreator: false,
                        verificationCode: token
                    });

                    newUser.save().then(result => {
                        console.log(result.verificationCode)
                        mailOptions = {
                            from: "SUST Virtual Classroom <process.env.EMAIL>",
                            to: email,
                            subject: "Please confirm your Gmail account by Verification Code",
                            html: "Hello,<br> Please give the code value to verify your email.<br>" + "<h1>" + result.verificationCode + "</h1>"
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
                        let verificationMessage = 'A verification code is sent to ' + email + ' .Give your Verification code to register successfully..';
                        request.flash('success_message', verificationMessage);
                        let link = '/userverification/' + result._id;
                        response.redirect(`${link}`);
                    }).catch(error => {
                        if (error) {
                            errors.push({
                                message: error
                            });
                            response.render('register', {
                                errors,
                                request_path
                            });
                        }
                    });
                }
            }
        )
    }
});

function generateOTP() {
    let digits = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

// Login Page
router.get('/login', forwardAuthenticated, (request, response) => {
    const request_path = (request.path);
    response.render('register', {
        path: request_path
    });
});

// Login Handle
router.post('/login', (request, response, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard-classes',
        failureRedirect: '/user/login',
        failureFlash: true
    })(request, response, next);
});

router.get('/logout', (request, response) => {
    request.logout();
    request.flash('success_message', 'You are logged out');
    response.redirect('/user/login');
});


router.post('/uploadverificationcode/:id', (request, response) => {
    const request_path = (request.path);
    let errors = [];
    User.findOne({
        _id: request.params.id
    }, (error, result) => {
        if (error) {
            errors.push({
                message: error
            });
        }
        if (errors.length > 0) {
            response.render('verification', {
                errors,
                path: request_path
            });
        } else {
            let v1 = result.verificationCode;
            let v2 = request.body.verification;
            console.log("v1 : " + v1 + '  ' + "v2 : " + v2);
            if (v1 === v2) {
                User.findOneAndUpdate({_id: request.params.id,}, {
                        isVerified: true,
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
                            response.render('verification', {
                                errors,
                                user: request.user,
                                path: request_path
                            });
                        } else {
                            request.flash('success_message', 'Verified successfully, now you can login..');
                            response.redirect('/user/login')
                        }
                    });
            } else {
                request.flash('error_message', 'Your verification code does not match..');
                response.redirect(`/user/${request.params.id}`);

            }
        }
    });
});

router.get('/updateyourpassword', (request, response) => {
    const request_path = (request.path);
    response.render('password-update', {
        path: request_path,
    });

});


router.post('/updatepassword', (request, response) => {
    const request_path = (request.path);
    let errors = [];
    // if (request.body.email) {
    //     User.findOne({
    //         email: request.body.email
    //     }, (error, result) => {
    //         if (error) {
    //             errors.push({
    //                 message: error
    //             });
    //         }
    //         if (errors.length > 0) {
    //             response.render('password-update', {
    //                 errors,
    //                 user: request.user,
    //                 path: request_path
    //             });
    //         } else {
    //             mailOptions = {
    //                 to: request.body.email,
    //                 subject: "Please confirm your Password by email",
    //                 html: "Hello,<br> Your password is.<br>" + "<h5>" + cryptr.decrypt(result.password.toString()) + "</h5>"
    //             };
    //             console.log(mailOptions);
    //             smtpTransport.sendMail(mailOptions, function (error, response) {
    //                 if (error) {
    //                     console.log(error);
    //                     // res.end("error");
    //                 } else {
    //                     console.log("Message sent: " + response.message);
    //                     // res.end("sent");
    //                 }
    //             });
    //             request.flash('success_message', 'Please,check your gmail to retrieve password');
    //             response.redirect('/user/login')
    //         }
    //     });
    // } else if (request.body.emailClone) {
    let password = request.body.password;
    if (!request.body.email || !password) {
        errors.push({
            message: 'Please fill in all fields'
        });
    }
    if (password.length < 6) {
        errors.push({
            message: 'Password should be at least 6 characters'
        })
    }
    if (errors.length > 0) {
        response.render('password-update', {
            errors,
            path: request_path
        });
    } else {
        let hashPassword = '';
        try {
            hashPassword = cryptr.encrypt(password);
        } catch (error) {
            console.log(error);
        }

        User.findOne({
            email: request.body.email
        }, (error, user) => {
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
                if (user === null) {
                    request.flash('error_message', 'Email does not registered..');
                    response.redirect('/user/updateyourpassword')
                } else {
                    User.findOneAndUpdate({
                            email: request.body.email
                        }, {
                            password: hashPassword,
                        },
                        {
                            new: true
                        }, (error, value) => {
                            console.log(value);
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
                                request.flash('success_message', 'Password successfully updated, Now you can login..');
                                response.redirect('/user/login')
                            }
                        });
                }
            }
        });
    }
});
module.exports = router;