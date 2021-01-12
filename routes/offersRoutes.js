const express = require("express");
const router = express.Router();
const auth = require("../Authorization/index");

const Business = require('../models/business');
const Like = require('../models/like');
const Offer = require('../models/offer');

const protected = auth.protected;

router.route('post-offer').post(protected, async(req, res) => {
    const {postedBy, title, content, expires, businessID} = req.body;
    const { accountType } = req.user.user;

    const newOffer = new Offer({
        title,
        content,
        postedBy,
        expires
    });

    const newLikes = new Like({
        count: 0,
        likes: 0,
        dislikes: 0,
        likesPostedBy: [],
        dislikesPostedBy: []
    });

    if (accountType !== 'business' || accountType !== 'admin') {
        return res.status(500).json({Message: 'No prights to post.'});
    }

    try {
        const initialLikes = await newLikes.save();
        newOffer.likes = initialLikes._id;
        const savedOffer = await newOffer.save();
        const updatedBusiness = await Business.findOneAndUpdate(
            {_id:businessID},
            { $push: { offers: savedOffert._id} },
            { new: true }
        );
        res.status(200).json({savedOffer, updatedBusiness});

    } catch (error) {
        res.status(400).json(error);
    }
});

router.route('delete-offer').post(protected, async(req, res) => {
    const {postedBy, commentID, businessID} = req.body;
    const {_id} = req.user.user;

    if (postedBy !== _id) return res.status(500).json({Message: 'Not authorized to delete.'});

    try {
        const deletedOffer = await Offer.findByIdAndDelete({_id: commentID});
        await Like.findByIdAndDelete({ _id: deletedOffer.likes });
        const updatedBusiness = await Business.findOneAndUpdate(
            {_id: businessID},
            { $pull: { offers: deletedOffer._id} }
        );
        res.status(200).json({deletedOffer, updatedBusiness});

    } catch (error) {
        res.status(400).json(error);
    }
});

router.route('edit-offfer').post(protected, async(req, res) => {
    const { postedBy, title, content, likes, expires,  offerID } = req.body;
    const { _id } = req.user.user;

    if (postedBy !== _id) return res.status(400).json({Message: 'Not authorized to edit.'});

    const update = { 
        $set: {
            title,
            content,
            likes,
            expires
        } 
    };

    const options = { new: true };

    try {
        const updatedOffer = await Offer.findByIdAndUpdate({_id: offerID}, update, options);
        res.status(200).json(updatedOffer);
    } catch (error) {
        res.status(400).json(error);
    }
});

module.exports = router;