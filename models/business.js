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
        maxlength: 50
    },
    businessDescription: {
        type: String,
        required: true
    },
    businessImages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image',
        required: true
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Business = mongoose.model('Business', BusinessSchema);
module.exports = Business;