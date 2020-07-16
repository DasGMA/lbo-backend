const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    avatar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image'
    },
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 2
    },
    loggedIn: {
        type: Boolean, 
        default: false
    },
    accountType: {
        type: String,
        enum: ['customer', 'business', 'admin'],
        default: 'customer',
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    password: {
        type: String,
        required: true
    },
    flagged: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', UserSchema);

module.exports = User;