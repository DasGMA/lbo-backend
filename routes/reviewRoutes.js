const express = require('express');

const auth = require('../Authorization/index');
const Business = require('../models/business');
const Like = require('../models/like');
const Review = require('../models/review');
const User = require('../models/user');
const protected = auth.protected;
const router = express.Router();

const getModel = (type) => {
    switch(type.toLowerCase()) {
        case 'business':
            return Business;
        case 'offer':
            return Offer;
        default:
            return;
    }
}

router.route('/write-review').post(protected, async (req, res) => {
    const { title, content, rating, posterId, _id, type } = req.body;
    const userId = req.user.user._id;
    // _id is business or offer ID, type is business or offer type

    if (userId !== posterId) {
        return res.status(500).json({ Message: 'Not original poster.'});
    };

    const newReview = new Review({
        title,
        content,
        rating,
        postedBy: posterId
    });

    const newLikes = new Like({
        count: 0,
        likes: 0,
        dislikes: 0,
        likesPostedBy: [],
        dislikesPostedBy: []
    });

    try {
        const likes = await newLikes.save();
        newReview.likes = likes._id;
        const review = await newReview.save();
        await User.findByIdAndUpdate(
            { _id: posterId }, 
            { $push: { reviews: reviewId }},
            { new: true }
        );
        await getModel(type).findByIdAndUpdate(
            {_id},
            { $push: { reviews: review._id }},
            { new: true });

        res.status(200).json(review);
    } catch (error) {
        res.status(400).json(error)
    }
});

router.route('/delete-review').delete(protected, async(req, res) => {
    const { reviewId, _id, type, posterId } = req.body;
    const userId = req.user.user._id;
    // _id is business or offer ID, type is business or offer type

    if (userId !== posterId) {
        return res.status(500).json({ Message: 'Not original poster.'});
    };

    try {
        const deletedReview = await Review.findByIdAndDelete({ _id: reviewId});
        await Like.findByIdAndDelete({ _id: deletedReview.likes });
        await User.findByIdAndUpdate(
            { _id: posterId }, 
            { $pull: { reviews: reviewId }},
            { new: true }
        );
        await getModel(type).findByIdAndUpdate(
            { _id },
            { $pull: { reviews: reviewId }},
            { new: true }
        );
        res.status(200).json(deletedReview);
    } catch (error) {
        res.status(400).json(error);
    }
});

router.route('/edit-review').post(protected, async(req, res) => {
    const { title, content, rating, posterId, reviewId } = req.body;
    const userId = req.user.user._id;

    if (userId !== posterId) {
        return res.status(500).json({ Message: 'Not original poster.'});
    };

    try {
        const editedReview = await Review.findByIdAndUpdate(
            { _id: reviewId },
            { $set: { title, content, rating }},
            { new: true }
        );
        res.status(200).json(editedReview);
    } catch (error) {
        res.status(400).json(error);
    }
});

module.exports = router;