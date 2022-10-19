const mongoose = require("mongoose");

const OfferSchema = mongoose.Schema(
  {
    type: {
      type: String,
      default: "offer",
    },
    title: {
      type: String,
      maxlength: 50,
      required: true,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    content: {
      type: String,
      required: true,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
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

const Offer = mongoose.model("Offer", OfferSchema);
module.exports = Offer;
