const mongoose = require('mongoose');

const MarkSchema = new mongoose.Schema({
    mark: {
        type: String,
        required:true
    },
    date: {
        type: String,
        required: true
    },
    assignmentID:{
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
    files: {
        type: Array
    }
});

const Mark = mongoose.model('Mark', MarkSchema);
module.exports = Mark;