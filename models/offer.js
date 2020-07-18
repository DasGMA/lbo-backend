const mongoose = require('mongoose');

const OfferSchema = mongoose.Schema({
    title: {
        type: String,
        maxlength: 50,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    expires: {
        type: Date,
        required: true
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    likes: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Like'
    }
}, {
    timestamps: true
});

const Offer = mongoose.model('Offer', OfferSchema);
module.exports = Offer;