const express = require('express');
const Business = require('../models/business');
const Address = require('../models/address');
const User = require('../models/user');
const Category = require('../models/category');
const Like = require('../models/like');
const Comment = require('../models/comment');
const Review = require('../models/review');
const Offer = require('../models/offer');

const router = express.Router();

const auth = require('../Authorization/index');
const protected = auth.protected;

router.route('/category-business-list').get(async (req, res) => {
    const { _id } = req.query;
    req.query.name;

    try {
        const businesses = await Business.find({ category: _id }).populate('businessAddress').exec();
        res.status(200).json(businesses);
    } catch (error) {
        res.status(400).json(error);
    }
});

router.route('/businesses').get(async (req, res) => {
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
        category,
        businessName,
        businessDescription,
        postedBy,
        streetApartmentNumber,
        streetName,
        country,
        state,
        city,
        zip,
        phoneNumber,
        businessEmail
    } = req.body;

    const newBusiness = new Business({
        category,
        businessName,
        businessDescription,
        postedBy,
        phoneNumber,
        businessEmail
    });

    const newAddress = new Address({
        streetApartmentNumber,
        streetName,
        country,
        state,
        city,
        zip
    });

    const newLikes = new Like({
        count: 0,
        likes: 0,
        dislikes: 0,
        likesPostedBy: [],
        dislikesPostedBy: []
    });

    if (accountType === 'business' || accountType === 'admin') {
        try {
            const savedAddress = await newAddress.save();
            const likes = await newLikes.save();
            newBusiness.businessAddress = savedAddress._id;
            newBusiness.likes = likes._id;
            const savedBusiness = await newBusiness.save();
            await Category.findByIdAndUpdate(
                { _id: category},
                { $push: { businesses: savedBusiness._id}, $inc: { businessCount: 1 } }
                );
            res.status(200).json(savedBusiness);
        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(400).json({Message: 'You have no priviledges to post a business.'});
    }
});

router.route('/business').get(async (req, res) => {
    const { _id } = req.query;
    try {
        const business = await Business.findById({ _id })
                                        .populate({
                                            path: 'postedBy',
                                            select: '-_id -password -__v -email'
                                        })
                                        .populate('businessAddress')
                                        .populate('businessCategory')
                                        .populate('likes')
                                        //.populate('businessImages')
                                        .populate('comments')
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
    const { newCategory, _id, postedBy } = req.body;

    const options = { new: true };

    if (accountType === 'admin' || (accountType === 'business' && postedBy === postedByID)) {
        try {
            const updatedBusiness = await Business.findByIdAndUpdate(
                { _id }, 
                { category: newCategory }, 
                options
            );
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
    const { _id, categoryID, postedBy } = req.body; // _id is business _id

    if (accountType === 'admin' || (accountType === 'business' && postedBy === postedByID)) {
        try {
            const business = await Business.findByIdAndDelete({ _id });
            await Address.findOneAndDelete({ _id: business.businessAddress });
            // Delete comments
            for (const commentID of business.comments) {
                await Comment.findByIdAndDelete({ _id: commentID });
            }
            // Delete reviews
            for (const reviewID of business.reviews) {
                await Review.findByIdAndDelete({ _id: reviewID });
            }
            // Delete offers
            for (const offerID of business.offers) {
                await Offer.findByIdAndDelete({ _id: offerID });
            }
            // Delete business images 
            // Code goes here

            // Remove user comments ObjectIds from array
            await User.update(
                { },
                { $pull: { 
                    comments: { $in: business.comments},
                    reviews: { $in: business.reviews}
                }},
                { multi: true }
            );
            await Category.findByIdAndUpdate(
                { _id: categoryID },
                { $pull: { businesses: _id },  $inc: { businessCount: -1}  }
            );
            res.status(200).json({Message: 'Deleted success!'});
        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(400).json({Message: 'You have no permissions.'});
    }
})


module.exports = router;