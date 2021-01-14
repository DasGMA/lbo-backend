const mongoose = require('mongoose');

const AvatarSchema = mongoose.Schema({
    image: {
        type: Object
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Avatar = mongoose.model('Avatar', AvatarSchema);
module.exports = Avatar;