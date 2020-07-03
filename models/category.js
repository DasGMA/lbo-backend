const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        unique: true
    },
    categoryDescription: {
        type: String
    }
})

const Category = mongoose.model('Category', CategorySchema);
module.exports = Category;