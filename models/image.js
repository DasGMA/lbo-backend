const mongoose = require('mongoose');

const ImageSchema = mongoose.Schema({
    image: {
        type: String,
        data: Buffer,
        required: true
    }
}, {
    timestamps: true
});

const Image = mongoose.model('Image', ImageSchema);
module.exports = Image;