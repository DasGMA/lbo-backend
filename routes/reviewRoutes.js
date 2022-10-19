const express = require("express");

const { averageRating } = require("../helpers");

const auth = require("../Authorization/index");
const Business = require("../models/business");
const Like = require("../models/like");
const Review = require("../models/review");
const User = require("../models/user");
const protected = auth.protected;
const router = express.Router();

const getModel = (type) => {
  switch (type.toLowerCase()) {
    case "business":
      return Business;
    case "offer":
      return Offer;
    default:
      return;
  }
};

router.route("/post-review").post(protected, async (req, res) => {
  const { title, content, rating, postedBy, _id, type } = req.body;
  const userId = req.user._id;
  // _id is business or offer ID, type is business or offer type

  if (userId !== postedBy) {
    return res.status(500).json({ Message: "Not original poster." });
  }

  const newReview = new Review({
    title,
    content,
    rating,
    postedBy,
  });

  const newLikes = new Like({
    count: 0,
    likes: 0,
    dislikes: 0,
    likesPostedBy: [],
    dislikesPostedBy: [],
  });

  try {
    const likes = await newLikes.save();
    newReview.likes = likes._id;
    const review = await newReview.save();
    await User.findByIdAndUpdate(
      { _id: postedBy },
      { $push: { reviews: review._id } },
      { new: true },
    );

    await getModel(type).findByIdAndUpdate(
      { _id },
      { $push: { reviews: review._id } },
      { new: true },
    );

    const node = await getModel(type).find({ _id }).populate("reviews").exec();

    await getModel(type).findByIdAndUpdate(
      { _id },
      { $set: { averageRating: averageRating(node) } },
      { new: true },
    );

    res.status(200).json(review);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.route("/delete-review").delete(protected, async (req, res) => {
  const { reviewId, _id, type, posterId } = req.body;
  const userId = req.user._id;
  const { accountType } = req.user;
  // _id is business or offer ID, type is business or offer type

  if (
    userId !== posterId ||
    accountType !== "admin" ||
    accountType !== "business"
  ) {
    return res.status(500).json({ Message: "Not authorized." });
  }

  try {
    const deletedReview = await Review.findByIdAndDelete({ _id: reviewId });
    await Like.findByIdAndDelete({ _id: deletedReview.likes });
    await User.findByIdAndUpdate(
      { _id: posterId },
      { $pull: { reviews: reviewId } },
      { new: true },
    );

    await getModel(type).findByIdAndUpdate(
      { _id },
      { $pull: { reviews: reviewId } },
      { new: true },
    );

    const node = await getModel(type).find({ _id }).populate("reviews").exec();

    await getModel(type).findByIdAndUpdate(
      { _id },
      { $set: { averageRating: averageRating(node) } },
      { new: true },
    );
    res.status(200).json(deletedReview);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.route("/edit-review").post(protected, async (req, res) => {
  const { title, content, rating, posterId, reviewId, type } = req.body;
  const userId = req.user._id;
  const { accountType } = req.user;

  if (userId !== posterId || accountType !== "admin") {
    return res.status(500).json({ Message: "Not authorized." });
  }

  try {
    const editedReview = await Review.findByIdAndUpdate(
      { _id: reviewId },
      { $set: { title, content, rating } },
      { new: true },
    );

    const node = await getModel(type).find({ _id }).populate("reviews").exec();

    await getModel(type).findByIdAndUpdate(
      { _id },
      { $set: { averageRating: averageRating(node) } },
      { new: true },
    );

    res.status(200).json(editedReview);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.route("/check").get(async (req, res) => {
  const node = await Business.find({ _id: "60107c4b9b8a5d0be9f69758" })
    .populate("reviews")
    .exec();

  console.log(averageRating(node));
  res.status(200).json(node);
});
module.exports = router;
