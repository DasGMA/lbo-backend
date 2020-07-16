const mongoose = require('mongoose');

const ImageSchema = mongoose.Schema({
    image: {
        type: String,
        data: Buffer
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Image = mongoose.model('Image', ImageSchema);
module.exports = Image;