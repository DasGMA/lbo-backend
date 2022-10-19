const express = require("express");
const router = express.Router();
const { upload, s3 } = require("../Media");
const { getBucketKey, getBucketKeysMulti } = require("../Media/mediaHelpers");

const auth = require("../Authorization/index");
const User = require("../models/user");
const Category = require("../models/category");
const Business = require("../models/business");
const BusinessImage = require("../models/image");

const protected = auth.protected;

const singleUpload = upload.fields([{ name: "image", maxCount: 1 }]);
const multiUpload = upload.array("images", 10);

router.route("/avatar-upload").post(protected, (req, res) => {
  singleUpload(req, res, function (err) {
    if (err) {
      return res
        .status(422)
        .send({
          errors: [{ title: "File Upload Error", detail: err.message }],
        });
    }

    User.findById({ _id: req.body.userid }, function (err, doc) {
      if (err) {
        console.log(error);
      }

      doc.avatar = { imageUrl: req.files.image[0].location };
      doc.save();
    });

    return res.status(200).json({ imageUrl: req.files.image[0].location });
  });
});

router.route("/category-image-upload").post(protected, (req, res) => {
  singleUpload(req, res, function (err) {
    if (err) {
      return res
        .status(422)
        .send({
          errors: [{ title: "File Upload Error", detail: err.message }],
        });
    }

    Category.findById({ _id: req.body.categoryid }, function (err, doc) {
      if (err) {
        console.log(error);
      }

      doc.image = { imageUrl: req.files.image[0].location };
      doc.save();
    });

    return res.status(200).json({ imageUrl: req.files.image[0].location });
  });
});

router.route("/delete-single-file").post(async (req, res) => {
  const { imageUrl } = req.body;
  const s3Params = getBucketKey(imageUrl);

  try {
    const data = await s3.deleteObject(s3Params).promise();
    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(422)
      .send({ errors: [{ title: "File delete error", detail: error.stack }] });
  }
});

router.route("/upload-multiple-files").post(protected, (req, res) => {
  multiUpload(req, res, async (err) => {
    try {
      await BusinessImage.findOneAndUpdate(
        { postedBy: req.body.businessid },
        {
          $push: {
            images: [...req.files],
          },
        },
        { new: true },
      );
      return res.status(200).json(req.files);
    } catch (error) {
      return res
        .status(422)
        .send({
          errors: [{ title: "File Upload Error", detail: err.message }],
        });
    }
  });
});

router.route("/delete-multi-files").post(protected, async (req, res) => {
  const s3params = {
    Bucket: "lbo-media",
    Delete: { Objects: getBucketKeysMulti(req.body.images) },
  };

  try {
    const data = await s3.deleteObjects(s3params).promise();
    await BusinessImage.findOneAndUpdate(
      { postedBy: req.body.businessid },
      { $pull: { images: { $in: req.body.images } } },
      { new: true },
    );
    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(422)
      .send({ errors: [{ title: "File delete error", detail: error.stack }] });
  }
});

module.exports = router;
