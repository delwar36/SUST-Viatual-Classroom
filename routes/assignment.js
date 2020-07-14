const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Task = require('../models/Task');
const Join = require('../models/Join');
const File = require('../models/Files');
const time = require('../configuration/Time');
const Submit = require('../models/Submit');
const Mark = require('../models/Mark');
const fs = require('fs');

const {ensureAuthenticated} = require('../configuration/auth');
const {forwardAuthenticated} = require('../configuration/auth');

router.get('/submit/:id', ensureAuthenticated, (request, response) => {
    const request_path = (request.path);
    let assignmentID = request.params.id.substring(0, 24);
    let classID = request.params.id.substring(24, 48);
    let errors = [];
    File.findOne({
        _id: assignmentID
    }, (error, result) => {
        if (error) {
            errors.push({
                message: error.message
            });
            if (errors.length > 0) {
                response.render('class-work-submit', {
                    errors,
                    user: request.user,
                    path: request_path
                });
            }
            console.log(result);
        } else {
            Submit.findOne({
                assignmentID: assignmentID,
                classID: classID,
                owner: request.user._id
            }, (error, submitAssignment) => {
                if (error) {
                    console.log(error);
                } else {
                    Submit.find({
                        assignmentID: assignmentID,
                        classID: classID,
                    }, (error, allSubmittedUser) => {
                        if (error) {
                            console.log(error);
                        } else {
                            let alreadySubmitted = [];
                            allSubmittedUser.forEach(userSubmitInfo => {
                                if (userSubmitInfo.groups) {
                                    userSubmitInfo.groups.forEach(user => {
                                        alreadySubmitted.push(user.registration);
                                    });
                                }
                            });
                            User.find({}, (error, allUser) => {
                                if (error) {
                                    console.log(error);
                                } else {
                                    Join.find({
                                        join: classID
                                    }, (error, joinedUser) => {
                                        if (error) {
                                            console.log(error);
                                        } else {
                                            let UserInfoArray = [];
                                            joinedUser.forEach(joinedUser => {
                                                let joinedUserId = joinedUser.joiner.toString();
                                                allUser.forEach(user => {
                                                    let userId = user._id.toString();
                                                    if (joinedUserId === userId) {
                                                        if (user.registration) {
                                                            if (alreadySubmitted.indexOf((user.registration)) === -1) {
                                                                let info = {
                                                                    name: user.name,
                                                                    email: user.email,
                                                                    registration: user.registration
                                                                };
                                                                UserInfoArray.push(info);
                                                            }
                                                        }
                                                    }
                                                });
                                            });
                                            response.render('class-work-submit', {
                                                path: request_path,
                                                user: request.user,
                                                UserInfoArray,
                                                result,
                                                submitAssignment,
                                                classID: classID
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

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


router.get('/joinedclassgrade/:id', ensureAuthenticated, (request, response) => {
    const request_path = (request.path);
    response.render('grades', {
        path: request_path,
        user: request.user
    });
});

router.get('/indvidualassignmentmark/:id', ensureAuthenticated, (request, response) => {
    const request_path = (request.path);
    const ID = request.params.id;
    const classID = ID.substring(0, 24);
    const postID = ID.substring(24, 48);

    File.findOne({
        _id: postID,
        classID: classID,
        select: "1"

    }, (error, file) => {
       if (error){
           console.log(error)
       } else {
           Submit.find({
               assignmentID: postID,
               classID: classID
           }, (error, submit) => {
               if (error) {
                   console.log(error)
               } else {
                   response.render('class-work-assignment-mark', {
                       path: request_path,
                       user: request.user,
                       submit,
                       file,
                       postID
                   });
               }
           });
       }
    });


});
router.get('/showclassgrade/:id', ensureAuthenticated, (request, response) => {
    const request_path = (request.path);
    response.render('grades', {
        path: request_path,
        user: request.user
    });
});


router.post('/submitassignment/:id', upload.array('submit_files', 2), ensureAuthenticated, (request, response) => {
    const request_path = (request.path);
    let assignmentID = request.params.id.substring(0, 24);
    let classID = request.params.id.substring(24, 48);
    let issue = request.body.issue;
    let dateTime = time.getTime();
    let errors = [];
    let date = new Date();
    let localTime = date.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true});

    User.find({}, (error, user) => {
        if (error) {
            if (error) {
                console.log(error);
            }
        } else {
            let submitUserInfo = [];
            let option = request.body.option;
            let optionType = typeof option;
            if (optionType === 'string') {
                user.forEach(userInformation => {
                    if (userInformation.registration) {
                        if (option === userInformation.email) {
                            let userInfo = {
                                name: userInformation.name,
                                registration: userInformation.registration,
                                email: userInformation.email
                            };
                            submitUserInfo.push(userInfo)
                        }
                    }
                });
            } else {
                request.body.option.forEach(submitAssignmentEmail => {
                    user.forEach(userInformation => {
                        if (userInformation.registration) {
                            if (submitAssignmentEmail === userInformation.email) {
                                let userInfo = {
                                    name: userInformation.name,
                                    registration: userInformation.registration,
                                    email: userInformation.email
                                };
                                submitUserInfo.push(userInfo)
                            }
                        }
                    });
                });
            }
            let submittedByUser = [];
            let userInfo = {
                name: request.user.name,
                email: request.user.email,
                picture: request.user.profile_picture
            };
            submittedByUser.push(userInfo);
            const submit = new Submit({
                issue: issue,
                submittedBy: submittedByUser,
                date: dateTime + " | " + localTime,
                owner: request.user.id,
                files: request.files,
                mark: null,
                groups: submitUserInfo,
                assignmentID: assignmentID,
                classID: classID
            });
            submit.save().then(result => {
                request.flash('success_message', 'Your class assignment submitted successfully...');
                response.redirect(`/submit/${request.params.id}`);
            }).catch(error => {
                if (error) {
                    errors.push({
                        message: error
                    });
                }
                response.render('class-work-submit', {
                    errors,
                    user: request.user,
                    path: request_path
                });
            });
        }
    });
});


router.post('/updateassignmentmark/:submitid/:postid', ensureAuthenticated, (request, response) => {
    const request_path = (request.path);
    let submitID = request.params.submitid;
    let postID = request.params.postid;
    let errors = [];
    Submit.findOneAndUpdate({_id: submitID, assignmentID: postID}, {
            mark: request.body.mark.toString(),
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
                response.render('class-work-assignment-mark', {
                    errors,
                    user: request.user,
                    path: request_path
                });
            } else {
                let link = value.classID + postID;
                request.flash('success_message', 'Number added successfully');
                response.redirect(`/indvidualassignmentmark/${link}`)
            }
        });
});

router.get('/deletesubmittedassignment/:id', ensureAuthenticated, (request, response) => {
    let submitId = request.params.id.substring(0, 24);
    let assignmentId = request.params.id.substring(24, 48);
    Submit.findOneAndDelete({
        _id: submitId,
        assignmentID: assignmentId,
        owner: request.user._id
    }, (error, result) => {
        if (error) {
            console.log(error)
        } else {
            fs.unlinkSync(`./public/uploads/${result.files[0].filename}`);
            let link = result.assignmentID + result.classID;
            request.flash('success_message', 'Your class materials/assignment deleted successfully...');
            response.redirect(`/submit/${link}`);
        }
    });
});

module.exports = router;