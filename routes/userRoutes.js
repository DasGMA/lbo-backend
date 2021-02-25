const express = require('express');
const User = require('../models/user');
const Business = require('../models/business');
const Address = require('../models/address');
const Comment = require('../models/comment');
const Offer = require("../models/offer");
const Review = require("../models/review");
const Like = require("../models/like");
const Avatar = require('../models/avatar');

const router = express.Router();
const bcrypt = require('bcryptjs');

const { protected, generateToken, refreshToken } = require('../Authorization/index');

router.route('/users').get(protected, async (req, res) => {
    const {accountType} = req.user.user;

    if (accountType === 'admin') {
        try {
            const users = await User.find();
            res.status(200).json(users);
        } catch (error) {
            res.status(400).json(error);
        }
    } else {
        res.status(500).json({Message: 'You have no access to users.'});
    }
})

router.route('/user').get(protected, async(req, res) => {
    const { _id } = req.user.user;

    try {
        const user = await User.findById({ _id });
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json(error);
    }
});

router.route('/register').post(async (req, res) => {
    const user = req.body;
    const hash = bcrypt.hashSync(user.password, 12);
    user.password = hash;

    const newUser = new User({
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        accountType: user.accountType.toLocaleLowerCase(),
        avatar: { 'imageUrl': 'https://lbo-images.s3.us-west-1.amazonaws.com/avatars/1610576183164'}
    });

    try {
        const userNew = await newUser.save();
        const token = generateToken(userNew);
        res.status(200).json({
                    message: 'User has been added.',
                    token
                });
    } catch (error) {
        res.status(400).json({error});
    }
       
});

router.route('/login').post(async(req, res) => {
    const { userName, password } = req.body;

    if (userName === '' || password === '') return res.status(400).json({Error: 'Empty login fields.'});

    try {
        const user = await User.findOne({ userName });
        if (user && bcrypt.compareSync(password, user.password)) {
            user.loggedIn = true;

            const token = generateToken(user);
            const refreshtoken = refreshToken(user);

            res.status(200).json({
                Message: 'Login successful',
                token,
                refreshtoken,
                session: req.sessionID,
                user
            });
        } else {
            res.status(400).json({LoginDetails: 'Wrong login details.'})
        }

    } catch (error) {
        console.log({error})
        res.status(400).json({error});
    }
});

router.route('/logout').post(protected, (req, res) => {
    const _id  = req.body;
    User.findOne({ _id })
        .then(user => {
            user.loggedIn = false;
            user.save()
                .then(() => {
                    req.session.destroy(error => {  
                        if (error){  
                            res.status(400).json({Message: error});
                        } else {  
                            res.status(200).json({Message: 'Logout successful.'});
                        }  
                    })
                })
                .catch(error => res.status(400).json({Error: error}))
            
        })
        .catch(error => {
            return res.status(400).json({Message: error})
        })
})

router.route('/delete-account').delete(protected, async (req, res) => {
    const _id = req.body._id;
    const accountType = req.user.user.accountType;
    try {
        const user = await User.findByIdAndDelete({ _id });
        // Need to check for user comments and delete them
        const comments = await Comment.deleteMany({ postedBy: _id });
        // Need to delete user posted images
        // Need to delete user posted reviews
        const reviews = await Review.deleteMany({ postedBy: _id });
        // Possibly delete likes? 

        
        // Checking for account type to avoid unneccessary documents search
        // on deletion if account type is 'client'
        if (accountType === 'admin' || accountType === 'business') {
            const business = await Business.findOneAndDelete({ postedBy: _id });
            const address = await Address.findOneAndDelete({ _id: business.businessAddress });
            // Search and delete other users that commented on that business
            for (const _id of business.comments) {
                await Comment.findByIdAndDelete({ _id });
            }
            // Delete reviews
            for (const _id of business.reviews) {
                await Review.findByIdAndDelete({ _id });
            }
            // Delete offers
            for (const offerID of business.offers) {
                await Offer.findByIdAndDelete({ _id: offerID });
            }
            // Delete assosiated likes 
            
            // Delete business images 
            // Code goes here

            // Remove user comments ObjectIds from array
            await User.updateMany(
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

            // Any other upcoming related refs
        }

        res.status(200).json({Message: `User with _id: ${_id} has been deleted!`});
    } catch (error) {
        res.status(400).json(error);
    }
})

router.route('/update').post(protected, async (req, res) => {
    const { _id } = req.user.user;
    const { userName, firstName, lastName, email, accountType, password } = req.body;

    const updatedUser = {
        userName,
        firstName,
        lastName,
        email,
        accountType,
        password
    }

    const options = {
        new: true
    }

    try {
        const user = await User.findByIdAndUpdate({_id}, updatedUser, options);
        res.status(200).json({Message: 'Updated success.', user});
    } catch (error) {
        res.status(400).json(error);
    }
});

router.route('/get-user-comments').post(protected, async (req, res) => {
    const { userID } = req.body;
    const { _id } = req.user.user;

    if (_id !== userID) return res.status(500).json({ Message: 'Not authorized.'});

    try {
        const userComments = await Comment.find({ postedBy: userID});
        res.status(200).json({Message: 'Success.', userComments});
    } catch (error) {
        res.status(400).json(error);
    }
});

router.route('/get-user-offers').post(protected, async (req, res) => {
    const { userID } = req.body;
    const { _id } = req.user.user;

    if (_id !== userID) return res.status(500).json({ Message: 'Not authorized.'});

    try {
        const userOffers = await Offer.find({ postedBy: userID});
        res.status(200).json({Message: 'Success.', userOffers});
    } catch (error) {
        res.status(400).json(error);
    }
});

router.route('/get-user-reviews').post(async (req, res) => {
    const { userID } = req.body;

    try {
        const userReviews = await Review.find({ postedBy: userID});
        res.status(200).json({Message: 'Success.', userReviews});
    } catch (error) {
        res.status(400).json(error);
    }
});



module.exports = router;