const mongoose = require('mongoose');

const JoinSchema = new mongoose.Schema({
    classcode: {
        type: String,
        required: true
    },
    owner_name: {
        type: String,
        required: true
    },
    owner_profile_picture: {
        type: String,
    },
    joiner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    join: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref : 'Task'
    },
    date: {
        type: String,
        required: true
    },
});

const Join = mongoose.model('Join', JoinSchema);
module.exports = Join;