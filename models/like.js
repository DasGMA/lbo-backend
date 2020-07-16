const mongoose = require('mongoose');

const LikeSchema = mongoose.Schema({
    count: {
        type: Number,
        default: 0,
    },
    postedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

const Like = mongoose.model('Like', LikeSchema);
module.exports = Like;