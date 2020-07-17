const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true
    },
    comment_owner_name: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    comment_owner_profile_picture: {
        type: String,
    },
    comment_task: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Task'
    },
    comment_post: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref : 'Files'
    }
});

const Comment = mongoose.model('Comments', CommentSchema);
module.exports  = Comment;