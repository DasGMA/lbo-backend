const express = require("express");
const router = express.Router();
const auth = require("../Authorization/index");

const Comment = require('../models/comment');
const Business = require('../models/business');
const Like = require('../models/like');
const Offer = require('../models/offer');

const protected = auth.protected;

// This function returns the models that we want to add likes to
// Just dont forget to import them

// Make sure model that you want to be liked, schema includes field 'likes'
// Make sure you create a new Like before creating that model

const getModel = (name) => {
    switch(name.toLowerCase()) {
        case 'business':
            return Business;
        case 'offer':
            return Offer;
        default:
            return;
    }
};

router.route('post-comment').post(protected, async(req, res) => {
    const {postedBy, title, content, modelName, modelID} = req.body;

    const newComment = new Comment({
        title,
        content,
        postedBy
    });

    const newLikes = new Like({
        count: 0,
        likes: 0,
        dislikes: 0,
        likesPostedBy: [],
        dislikesPostedBy: []
    });

    try {
        const initialLikes = await newLikes.save();
        newComment.likes = initialLikes._id;
        const savedComment = await newComment.save();
        const updatedModel = await getModel(modelName).findOneAndUpdate(
            {_id: modelID},
            { $push: { comments: savedComment._id} }
        );
        res.status(200).json({savedComment, updatedModel});

    } catch (error) {
        res.status(400).json(error);
    }
});

router.route('delete-comment').post(protected, async(req, res) => {
    const {postedBy, modelName, commentID, modelID} = req.body;
    const {_id} = req.user.user;

    if (postedBy !== _id) return res.status(500).json({Message: 'Not authorized to delete.'});

    try {
        const deletedComment = await Comment.findByIdAndDelete({_id: commentID});
        await Like.findByIdAndDelete({ _id: deletedComment.likes });
        const updatedModel = await getModel(modelName).findOneAndUpdate(
            {_id: modelID},
            { $pull: { comments: deletedComment._id} }
        );
        res.status(200).json({deletedComment, updatedModel});

    } catch (error) {
        res.status(400).json(error);
    }
});

router.route('edit-comment').post(protected, async(req, res) => {
    const { postedBy, title, content, likes, commentID } = req.body;
    const {_id} = req.user.user;

    if (postedBy !== _id) return res.status(500).json({Message: 'Not authorized to edit.'});

    const update = {
        title,
        content,
        likes
    }

    try {
        const updatedComment = await Comment.findByIdAndUpdate(
            {_id: commentID},
            update,
            { new: true }
            );
        
        res.status(200).json(updatedComment);

    } catch (error) {
        res.status(400).json(error);
    }
});

module.exports = router;