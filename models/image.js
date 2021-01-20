const mongoose = require('mongoose');

const BusinessImageSchema = mongoose.Schema({
    images: {
        type: Array
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business'
    }
}, {
    timestamps: true
});

const BusinessImage = mongoose.model('BusinessImage', BusinessImageSchema);
module.exports = BusinessImage;