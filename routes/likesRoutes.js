const express = require("express");
const Business = require("../models/business");
const Comment = require("../models/comment");
const Offer = require("../models/offer");
const Review = require("../models/review");
const Like = require("../models/like");

const router = express.Router();

const auth = require("../Authorization/index");
const protected = auth.protected;

// This function returns the models that we want to add likes to
// Just dont forget to import them

// Make sure model that you want to be liked, schema includes field 'likes'
// Make sure you create a new Like before creating that model

const getModel = (type) => {
  switch (type.toLowerCase()) {
    case "business":
      return Business;
    case "comment":
      return Comment;
    case "offer":
      return Offer;
    case "review":
      return Review;
    default:
      return;
  }
};

router.route("/like").post(protected, async (req, res) => {
  // TYPE is is the name of model in mongodb, each model has Type attribute
  // modelID is an ID of the model that is being liked
  // userID is the id of the user who is liking or disliking
  const { type, modelID, userID } = req.body;
  try {
    const model = await getModel(type)
      .find({ _id: modelID })
      .populate("likes")
      .exec();
    if (
      !model[0].likes.likesPostedBy.includes(userID) &&
      !model[0].likes.dislikesPostedBy.includes(userID)
    ) {
      const like = await Like.findByIdAndUpdate(
        { _id: model[0].likes._id },
        { $push: { likesPostedBy: userID }, $inc: { count: 1, likes: 1 } },
      );
      res.status(200).json({
        Message: `Like increased by 1 to modelID ${modelID} with likeID ${like._id} by userID ${userID}`,
        like,
      });
    } else if (model[0].likes.likesPostedBy.includes(userID)) {
      const like = await Like.findByIdAndUpdate(
        { _id: model[0].likes._id },
        { $pull: { likesPostedBy: userID }, $inc: { count: -1, likes: -1 } },
      );
      res.status(200).json({
        Message: `Like decreased by 1 to modelID ${modelID} with likeID ${like._id} because user ${userID} already had a like.`,
        like,
      });
    } else if (model[0].likes.dislikesPostedBy.includes(userID)) {
      const like = await Like.findByIdAndUpdate(
        { _id: model[0].likes._id },
        {
          $pull: { dislikesPostedBy: userID },
          $inc: { count: 1, dislikes: -1 },
        },
      );
      res.status(200).json({
        Message: `Like increased by 1 to modelID ${modelID} with likeID ${like._id} because user ${userID} already had a dislike.`,
        like,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.route("/dislike").post(protected, async (req, res) => {
  // type is actual model name in mongodb
  // modelID is an ID of the model that is being liked
  // userID is the id of the user who is liking
  const { type, modelID, userID } = req.body;

  try {
    const model = await getModel(type)
      .find({ _id: modelID })
      .populate("likes")
      .exec();
    if (
      !model[0].likes.likesPostedBy.includes(userID) &&
      !model[0].likes.dislikesPostedBy.includes(userID)
    ) {
      const like = await Like.findByIdAndUpdate(
        { _id: model[0].likes._id },
        {
          $push: { dislikesPostedBy: userID },
          $inc: { count: -1, dislikes: 1 },
        },
      );
      res.status(200).json({
        Message: `Like decreased by 1 to modelID ${modelID} with likeID ${like._id} by userID ${userID}`,
        like,
      });
    } else if (model[0].likes.dislikesPostedBy.includes(userID)) {
      const like = await Like.findByIdAndUpdate(
        { _id: model[0].likes._id },
        {
          $pull: { dislikesPostedBy: userID },
          $inc: { count: 1, dislikes: -1 },
        },
      );
      res.status(200).json({
        Message: `Like increased by 1 to modelID ${modelID} with likeID ${like._id} because user ${userID} already had a dislike.`,
        like,
      });
    } else if (model[0].likes.likesPostedBy.includes(userID)) {
      const like = await Like.findByIdAndUpdate(
        { _id: model[0].likes._id },
        { $pull: { likesPostedBy: userID }, $inc: { count: -1, likes: -1 } },
      );
      res.status(200).json({
        Message: `Like decreased by 1 to modelID ${modelID} with likeID ${like._id} because user ${userID} already had a like.`,
        like,
      });
    }
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
