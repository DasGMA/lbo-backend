const express = require("express");
const User = require("../models/user");
const Business = require("../models/business");
const Address = require("../models/address");
const Comment = require("../models/comment");
const Offer = require("../models/offer");
const Review = require("../models/review");
const Like = require("../models/like");
const Avatar = require("../models/avatar");

const router = express.Router();
const bcrypt = require("bcryptjs");

const {
  protected,
  generateToken,
  generateRefreshToken,
  randomTokenString,
  hash,
  userDetails,
  sendVerificationEmail,
  sendAlreadyRegisteredEmail,
} = require("../Authorization/index");
const Token = require("../models/token");

router.route("/users").get(protected, async (req, res) => {
  const { accountType } = req.user;

  if (accountType !== "admin") {
    return res.status(500).json({ Message: "You have no access to users." });
  }

  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.route("/user").get(protected, async (req, res) => {
  const { _id } = req.user;

  try {
    const user = await User.findById({ _id });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.route("/register").post(async (req, res) => {
  const { user } = req.body;
  const origin = req.get("origin");
  console.log(origin);
  // If already registered send email to inform the user
  if (
    (await User.findOne({ email: user.email })) ||
    (await User.findOne({ userName: user.userName }))
  ) {
    return await sendAlreadyRegisteredEmail(user.email);
  }

  // Hash password
  const hashPassword = hash(user.password);
  user.password = hashPassword;

  const newUser = new User({
    userName: user.userName,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    verificationToken: randomTokenString(),
    password: user.password,
    accountType: user.accountType.toLocaleLowerCase(),
    avatar: {
      imageUrl:
        "https://lbo-images.s3.us-west-1.amazonaws.com/avatars/1610576183164",
    },
  });

  try {
    const userNew = await newUser.save();
    await sendVerificationEmail(userNew, origin);
    res.status(200).json({ message: "User has been added.", user: userNew });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.route("/verify-email").post(async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ verificationToken: token });
    user.verified = Date.now();
    await user.save();

    res.status(200).json({ Message: "Verification successful." });
  } catch (error) {
    res.status(401).json({ Message: error.message });
  }
});

router.route("/login").post(async (req, res) => {
  const { userName, password } = req.body;
  const { ip } = req;

  if (userName === "" || password === "") {
    return res.status(401).json({ Error: "Empty login fields." });
  }

  try {
    const user = await User.findOne({ userName });

    if (user && bcrypt.compareSync(password, user.password)) {
      const token = generateToken(user);
      const refreshToken = await generateRefreshToken(user, ip);

      user.loggedIn = true;
      await user.save();

      res.status(200).json({
        Message: "Login successful",
        user: userDetails(user),
        token,
        refreshToken: refreshToken.token,
      });
    } else {
      res.status(400).json({ LoginDetails: "Wrong login details." });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.route("/logout").post(protected, async (req, res) => {
  const _id = req.body;

  try {
    const user = await User.findOne({ _id });
    user.loggedIn = false;
    await user.save();

    // Destroy session
    req.session.destroy();

    return res.status(200).json({ Message: "Logout successful." });
  } catch (error) {
    return res.status(400).json({ Message: error });
  }
});

router.route("/delete-account").delete(protected, async (req, res) => {
  const _id = req.body._id;
  const accountType = req.user.accountType;
  try {
    const user = await User.findByIdAndDelete({ _id });
    // Need to check for user comments and delete them
    const comments = await Comment.deleteMany({ postedBy: _id });
    // Need to delete user posted images
    // Need to delete user posted reviews
    const reviews = await Review.deleteMany({ postedBy: _id });
    // Possibly delete likes?

    // Checking for account type to avoid unneccessary documents search
    // on deletion if account type is 'client'
    if (accountType === "admin" || accountType === "business") {
      const business = await Business.findOneAndDelete({ postedBy: _id });
      const address = await Address.findOneAndDelete({
        _id: business.businessAddress,
      });
      // Search and delete other users that commented on that business
      for (const _id of business.comments) {
        await Comment.findByIdAndDelete({ _id });
      }
      // Delete reviews
      for (const _id of business.reviews) {
        await Review.findByIdAndDelete({ _id });
      }
      // Delete offers
      for (const offerID of business.offers) {
        await Offer.findByIdAndDelete({ _id: offerID });
      }
      // Delete assosiated likes

      // Delete business images
      // Code goes here

      // Remove user comments ObjectIds from array
      await User.updateMany(
        {},
        {
          $pull: {
            comments: { $in: business.comments },
            reviews: { $in: business.reviews },
          },
        },
        { multi: true },
      );
      await Category.findByIdAndUpdate(
        { _id: categoryID },
        { $pull: { businesses: _id }, $inc: { businessCount: -1 } },
      );

      // Any other upcoming related refs
    }

    res
      .status(200)
      .json({ Message: `User with _id: ${_id} has been deleted!` });
  } catch (error) {
    res.status(400).json(error);
  }
});

router.route("/update").post(protected, async (req, res) => {
  const { _id } = req.user;
  const { userName, firstName, lastName, email, accountType, password } =
    req.body;

  const updatedUser = {
    userName,
    firstName,
    lastName,
    email,
    accountType,
    password,
  };

  const options = {
    new: true,
  };

  try {
    const user = await User.findByIdAndUpdate({ _id }, updatedUser, options);
    res.status(200).json({ Message: "Updated success.", user });
  } catch (error) {
    res.status(400).json(error);
  }
});

router.route("/get-user-comments").post(protected, async (req, res) => {
  const { userID } = req.body;
  const { _id } = req.user;

  if (_id !== userID)
    return res.status(500).json({ Message: "Not authorized." });

  try {
    const userComments = await Comment.find({ postedBy: userID });
    res.status(200).json({ Message: "Success.", userComments });
  } catch (error) {
    res.status(400).json(error);
  }
});

router.route("/get-user-offers").post(protected, async (req, res) => {
  const { userID } = req.body;
  const { _id } = req.user;

  if (_id !== userID)
    return res.status(500).json({ Message: "Not authorized." });

  try {
    const userOffers = await Offer.find({ postedBy: userID });
    res.status(200).json({ Message: "Success.", userOffers });
  } catch (error) {
    res.status(400).json(error);
  }
});

router.route("/get-user-reviews").post(async (req, res) => {
  const { userID } = req.body;

  try {
    const userReviews = await Review.find({ postedBy: userID });
    res.status(200).json({ Message: "Success.", userReviews });
  } catch (error) {
    res.status(400).json(error);
  }
});

router.route("/tokens").get(async (req, res) => {
  const tokens = await Token.remove();
  res.status(200).json(tokens);
});

module.exports = router;
