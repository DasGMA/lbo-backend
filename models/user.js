const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    type: { type: String, default: "user" },
    avatar: Object,
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
    },
    accountType: {
      type: String,
      enum: ["customer", "business", "admin"],
      default: "customer",
      required: true,
    },
    loggedIn: { type: Boolean, default: false },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    passwordReset: Date,
    flagged: { type: Boolean, default: false },
    acceptTerms: Boolean,
    verificationToken: String,
    verified: Date,
    resetToken: { token: String, expires: Date },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  {
    timestamps: true,
  },
);

UserSchema.virtual("isVerified").get(function () {
  return !!(this.verified || this.passwordReset);
});

UserSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret.password;
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
