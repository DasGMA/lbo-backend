const mongoose = require('mongoose');

const OfferSchema = mongoose.Schema({
    title: {
        type: String,
        maxlength: 50,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    expires: {
        type: Date,
        required: true
    },
    comments: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business'
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Offer = mongoose.model('Offer', OfferSchema);
module.exports = Offer;