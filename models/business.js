const mongoose = require('mongoose');

const BusinessSchema = mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    businessName: {
        type: String,
        required: true,
        maxlength: 50,
        unique: true
    },
    averageRating: {
        type: Number,
        default: 0
    },
    businessDescription: {
        type: String,
        required: true
    },
    businessAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    businessEmail: {
        type: String,
        required: true
    },
    businessImages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image'
    }],
    offers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    likes: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Like'
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Business = mongoose.model('Business', BusinessSchema);
module.exports = Business;