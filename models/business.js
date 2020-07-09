const mongoose = require('mongoose');

const BusinessSchema = mongoose.Schema({
    businessCategory: {
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
    businessDescription: {
        type: String,
        required: true
    },
    businessAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    },
    businessImages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
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