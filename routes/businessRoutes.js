const express = require('express');
const Business = require('../models/business');
const Address = require('../models/address');

const router = express.Router();

const auth = require('../Authorization/index');
const protected = auth.protected;

router.route('/').get(async (req, res) => {
    try {
        const businesses = await Business.find();
        res.status(200).json(businesses);
    } catch (error) {
        res.status(400).json(error);
    }
});

router.route('/post-business').post(protected, async (req, res) => {
    const accountType = req.user.user.accountType;
    const {
        businessCategory,
        businessName,
        businessDescription,
        postedBy,
        streetApartmentNumber,
        streetName,
        country,
        state,
        city,
        zip
    } = req.body;

    const newBusiness = new Business({
        businessCategory,
        businessName,
        businessDescription,
        postedBy
    });

    const newAddress = new Address({
        streetApartmentNumber,
        streetName,
        country,
        state,
        city,
        zip
    });

    if (accountType === 'business' || accountType === 'admin') {
        try {
            const savedAddress = await newAddress.save();
            newBusiness.businessAddress = savedAddress._id;
            const savedBusiness = await newBusiness.save();
            res.status(200).json(savedBusiness);
        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(400).json({Message: 'You have no priviledges to post a business.'})
    }
});

router.route('/:businessName').get(async (req, res) => {
    const {businessName} = req.params;
    const { _id } = req.body;

    try {
        const business = await Business.findOne({ _id });
        res.status(200).json(business);
    } catch (error) {
        res.status(400).json(error);
    }
});

router.route('/update-business-name').post(protected, async (req, res) => {
    const accountType = req.user.user.accountType;
    const { businessName, _id } = req.body;

    const newBusinessName = { businessName };
    const options = { new: true };

    if (accountType === 'admin' || accountType === 'business') {
        try {
            const checkForBusinessName = await Business.findOne({ businessName });
            if (!checkForBusinessName) {
                const updatedBusiness = Business.findByIdAndUpdate({ _id }, newBusinessName, options);
                res.status(200).json(updatedBusiness);
            } else {
                res.status(400).json({Message: 'Business name already taken.'});
            }
        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(400).json({Message: 'You have no permissions.'});
    }
});

router.route('/update-business-category').post(protected, async (req, res) => {
    const accountType = req.user.user.accountType;
    // businessCategory is category's _id
    const { businessCategory, _id } = req.body;

    const newBusinessCategory = { businessCategory };
    const options = { new: true };

    if (accountType === 'admin' || accountType === 'business') {
        try {
            const updatedBusiness = Business.findByIdAndUpdate({ _id }, newBusinessCategory, options);
            res.status(200).json(updatedBusiness);
        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(400).json({Message: 'You have no permissions.'});
    }
});

router.route('/update-business-description').post(protected, async (req, res) => {
    const accountType = req.user.user.accountType;
    const { businessDescription, _id } = req.body;

    const newBusinessDescription = { businessDescription };
    const options = { new: true };

    if (accountType === 'admin' || accountType === 'business') {
        try {
            const updatedBusiness = Business.findByIdAndUpdate({ _id }, newBusinessDescription, options);
            res.status(200).json(updatedBusiness);
        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(400).json({Message: 'You have no permissions.'});
    }
});


module.exports = router;