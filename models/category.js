const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: Object
    },
    type: {
        type: String,
        default: 'category'
    },
    categoryDescription: {
        type: String
    },
    businesses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business'
    }],
    businessCount: {
        type: Number,
        default: 0,
        min: 0
    }
})

const Category = mongoose.model('Category', CategorySchema);
module.exports = Category;