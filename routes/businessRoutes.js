const express = require('express');
const Business = require('../models/business');
const Address = require('../models/address');
const User = require('../models/user');
// const Comment = require('../models/comment');
// const Review = require('../models/review');



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

router.route('/one').get(async (req, res) => {
    const { _id } = req.body;
    try {
        const business = await Business.findById({ _id })
                                        .populate({
                                            path: 'postedBy',
                                            select: '-_id -password -__v -email'
                                        })
                                        .populate('businessAddress')
                                        .populate('businessCategory')
                                        //.populate('businessImages')
                                        //.populate('comments')
                                        .exec();
        res.status(200).json(business);
    } catch (error) {
        res.status(400).json(error);
    }
});

router.route('/update-business-name').post(protected, async (req, res) => {
    const accountType = req.user.user.accountType;
    const postedByID = req.user.user._id;
    const { businessName, _id, postedBy } = req.body;

    const newBusinessName = { businessName };
    const options = { new: true };

    if (accountType === 'admin' || (accountType === 'business' && postedBy === postedByID)) {
        try {
            const checkForBusinessName = await Business.findOne({ businessName });
            if (!checkForBusinessName) {
                const updatedBusiness = await Business.findByIdAndUpdate({ _id }, newBusinessName, options);
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
    const postedByID = req.user.user._id;
    // businessCategory is category's _id
    const { businessCategory, _id, postedBy } = req.body;

    const newBusinessCategory = { businessCategory };
    const options = { new: true };

    if (accountType === 'admin' || (accountType === 'business' && postedBy === postedByID)) {
        try {
            const updatedBusiness = await Business.findByIdAndUpdate({ _id }, newBusinessCategory, options);
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
    const postedByID = req.user.user._id;
    const { businessDescription, _id, postedBy } = req.body;

    const newBusinessDescription = { businessDescription };
    const options = { new: true };

    if (accountType === 'admin' || (accountType === 'business' && postedBy === postedByID)) {
        try {
            const updatedBusiness = await Business.findByIdAndUpdate({ _id }, newBusinessDescription, options);
            res.status(200).json(updatedBusiness);
        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(400).json({Message: 'You have no permissions.'});
    }
});


router.route('/delete-business').delete(protected, async (req, res) => {
    const accountType = req.user.user.accountType;
    const postedByID = req.user.user._id;
    const { _id } = req.body;

    if (accountType === 'admin' || (accountType === 'business' && postedBy === postedByID)) {
        try {
            const business = await Business.findByIdAndDelete({ _id });
            const address = await Address.findOneAndDelete({ _id: business.businessAddress });
            // Delete comments
            // for (const _id of business.comments) {
                // await Comment.findByIdAndDelete({ _id });
            // }
            // Delete reviews
            // for (const _id of business.reviews) {
                // await Review.findByIdAndDelete({ _id });
            // }

            // Remove user comments ObjectIds from array
            await User.update(
                { },
                { $pull: { 
                    comments: { $in: business.businessComments},
                    reviews: { $in: business.reviews}
                }},
                { multi: true }
            )
            res.status(200).json({Message: 'Deleted success!'});
        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(400).json({Message: 'You have no permissions.'});
    }
})


module.exports = router;