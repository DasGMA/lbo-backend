const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema(
  {
    type: {
      type: String,
      default: "review",
    },
    title: {
      type: String,
      required: true,
      maxLength: 50,
    },
    content: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    likes: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Like",
    },
  },
  {
    timestamps: true,
  },
);

const Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;
