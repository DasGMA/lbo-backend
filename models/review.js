const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxLength: 50
    },
    content: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;