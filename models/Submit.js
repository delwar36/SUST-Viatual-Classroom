const mongoose = require('mongoose');

const SubmitSchema = new mongoose.Schema({
    issue: {
        type: String,
        trim: true,
    },
    date: {
        type: String,
        required: true
    },
    assignmentID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Files'
    },
    classID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Task'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    mark:{
        type: String,
    },
    submittedBy: {
        type: Array
    },
    groups: {
        type: Array
    },
    files: {
        type: Array
    }
});

const Submit = mongoose.model('Submit', SubmitSchema);
module.exports = Submit;