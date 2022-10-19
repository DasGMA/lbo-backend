const mongoose = require("mongoose");

const LikeSchema = mongoose.Schema({
  type: {
    type: String,
    default: "like",
  },
  count: {
    type: Number,
    default: 0,
  },
  dislikes: {
    type: Number,
    default: 0,
    min: 0,
  },
  likes: {
    type: Number,
    default: 0,
    min: 0,
  },
  likesPostedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  dislikesPostedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Like = mongoose.model("Like", LikeSchema);
module.exports = Like;
