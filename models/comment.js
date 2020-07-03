const mongoose = require('mongoose');

const CommentSchema = mongoose.Schema({
    commentTitle: {
        type: String,
        required: true,
        maxLength: 50
    },
    commentBody: {
        type: String,
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;