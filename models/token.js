const mongoose = require('mongoose');

const TokenSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    token: String,
    expires: Date,
    created: { 
        type: Date, 
        default: Date.now
    },
    createdByIp: String,
    revoked: Date,
    revokedByIp: String,
    replacedByToken: String
});

TokenSchema.virtuals('isExpired').get(function () {
    return Date.now() >= this.expires;
});

TokenSchema.virtuals('isActive').get(function () {
    return !this.isExpired && !this.revoked;
});

TokenSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.id;
        delete ret.user;
    }
});

const Token = mongoose.model('Token', TokenSchema);

module.exports = Token;