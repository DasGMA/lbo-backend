const express = require('express');
const Category = require('../models/category');
const Business = require('../models/business');

const router = express.Router();

const auth = require('../Authorization/index');
const protected = auth.protected;

router.route('/').get(async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(400).json(error);
    }
});

router.route('/:category').get(async (req, res) => {
    const category = req.params;
    const _id = req.body;

    try {
        const businesses = await Business.find({ category: _id });
        res.status(200).json(businesses);
    } catch (error) {
        res.status(400).json(error)
    }
});

router.route('/post').post(protected, async (req, res) => {
    const accountType = req.user.user.accountType;
    const {categoryName, categoryDescription} = req.body;

    const newCategory = new Category({
        categoryName,
        categoryDescription
    });

    if (accountType === 'admin') {
        try {
            const addedCategory = newCategory.save();
            res.status(200).json(addedCategory);
        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(400).json({'AdminRights': 'You have no admin rights.'});
    }
})

module.exports = router;