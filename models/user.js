const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    avatar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Photos'
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
    password: {
        type: String,
        required: true
    },
    zip: {
        type: Number,
        minlength: 5,
        maxlength: 5,
        default: 00000
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', UserSchema);

module.exports = User;