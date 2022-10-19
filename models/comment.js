const mongoose = require("mongoose");

const CommentSchema = mongoose.Schema(
  {
    type: {
      type: String,
      default: "comment",
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

const Comment = mongoose.model("Comment", CommentSchema);
module.exports = Comment;
