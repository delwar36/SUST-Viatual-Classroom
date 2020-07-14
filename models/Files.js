const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    select: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        trim: true,
        required: true
    },
    isPinned: {
        type: Boolean
    },
    assignmentTopic: {
        type: String,
        trim: true,
    },
    date: {
        type: String,
        required: true
    },
    Due: {
        type: String,
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

const File = mongoose.model('File', FileSchema);
module.exports = File;