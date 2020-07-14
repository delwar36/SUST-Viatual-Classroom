const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    classname: {
        type: String,
        required: true
    },
    batch: {
        type: String,
        trim: true,
        required: true
    },
    topic: {
        type: String,
        trim: true,
        required: true,
    },
    background_image: {
        type: String
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    class_code: {
        type: String
    },
    teachers: {
        type: Array
    }
});

const Task = mongoose.model('Task', TaskSchema);
module.exports = Task;