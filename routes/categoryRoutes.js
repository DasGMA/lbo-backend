const express = require("express");
const Category = require("../models/category");
const Business = require("../models/business");
const Address = require("../models/address");
const User = require("../models/user");
const Like = require("../models/like");
const Comment = require("../models/comment");
const Review = require("../models/review");
const Offer = require("../models/offer");
const BusinessImage = require("../models/image");

const router = express.Router();

const auth = require("../Authorization/index");
const { getBucketKeysMulti } = require("../Media/mediaHelpers");
const { s3 } = require("../Media");
const protected = auth.protected;

router.route("/categories").get(async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.route("/post-category").post(protected, async (req, res) => {
  const accountType = req.user.accountType;
  const { categoryName, categoryDescription } = req.body;

  const newCategory = new Category({
    categoryName,
    categoryDescription,
  });

  if (accountType === "admin") {
    try {
      const addedCategory = await newCategory.save();
      res.status(200).json(addedCategory);
    } catch (error) {
      res.status(400).json(error);
    }
  } else {
    res.status(400).json({ AdminRights: "You have no admin rights." });
  }
});

router.route("/edit-category").post(protected, async (req, res) => {
  const { accountType } = req.user;
  const { _id, categoryName, categoryDescription } = req.body;

  const options = { new: true };
  const update = { $set: { categoryName, categoryDescription } };

  if (accountType === "admin") {
    try {
      const updatedCategory = await Category.findByIdAndUpdate(
        { _id },
        update,
        options,
      );
      res.status(200).json(updatedCategory);
    } catch (error) {
      res.status(400).json(error);
      console.log(error);
    }
  } else {
    res.status(400).json({ "Admin Rights": "You have no admin rights." });
  }
});

router.route("/delete-category").delete(protected, async (req, res) => {
  const { accountType } = req.user;
  const { _id } = req.body;

  if (accountType === "admin") {
    try {
      const category = await Category.findByIdAndDelete({ _id });
      if (category.businessCount > 0) {
        for (const business of category.businesses) {
          const deletedBusiness = await Business.findByIdAndDelete({
            _id: business._id,
          })
            .populate("businessImages")
            .exec();
          // Delete business images mongodb and aws s3
          const s3params = {
            Bucket: "lbo-media",
            Delete: {
              Objects: getBucketKeysMulti(
                deletedBusiness.businessImages.images,
              ),
            },
          };
          await s3.deleteObjects(s3params).promise();
          await BusinessImage.findOneAndDelete({
            postedBy: deletedBusiness._id,
          });

          // Delete address
          await Address.findByIdAndDelete({
            _id: deletedBusiness.businessAddress,
          });
          // Delete likes
          await Like.findByIdAndDelete({ _id: deletedBusiness.likes });
          // Delete comments
          for (const commentID of deletedBusiness.comments) {
            const comment = await Comment.findByIdAndDelete({ _id: commentID });
            // Delete associated likes
            await Like.findByIdAndDelete({ _id: comment.likes });
          }
          // Delete reviews
          for (const reviewID of deletedBusiness.reviews) {
            const review = await Review.findByIdAndDelete({ _id: reviewID });
            // Delete associated likes
            await Like.findByIdAndDelete({ _id: review.likes });
          }
          // Delete offers
          for (const offerID of deletedBusiness.offers) {
            const offer = await Offer.findByIdAndDelete({ _id: offerID });
            // Delete associated likes
            await Like.findByIdAndDelete({ _id: offer.likes });
          }

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
        }
      }
      res.status(200).json(category);
    } catch (error) {
      console.log(error);
      res.status(400).json(error);
    }
  } else {
    res.status(400).json({ "Admin Rights": "You have no admin rights." });
  }
});

module.exports = router;
