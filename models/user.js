const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    avatar: String,
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
        default: 'customer'
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
        required: false,
        minLength: 5,
        maxLength: 5,
        default: 00000
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', UserSchema);

module.exports = User;