const express = require("express");
const router = express.Router();
const { upload, s3 } = require('../Media-upload');
const { getBucketKey } = require('../Media-upload/mediaHelpers');

const auth = require('../Authorization/index');
const User = require("../models/user");

const protected = auth.protected;

const singleUpload = upload.fields([{ name: 'image', maxCount: 1 }]);
const multiUpload = upload.array('image');

router.route('/avatar-upload').post(protected, (req, res) => {
    singleUpload(req, res, function(err) {
        if (err) {
          return res.status(422).send({errors: [{title: 'File Upload Error', detail: err.message}] });
        }
        
        User.findById({ _id: req.body.userid }, function(err, doc) {
            if (err) {
                console.log(error)
            }

            doc.avatar = {'imageUrl': req.files.image[0].location};
            doc.save();
        })

        return res.status(200).json({'imageUrl': req.files.image[0].location});
    });
});

router.route('/delete-single-file').post((req, res) => {
    const { imageUrl } = req.body;
    const s3Params = getBucketKey(imageUrl);

    s3.deleteObject(s3Params, (err, data) => {
        if (err) {
            return res.status(422).send({errors: [{title: 'File delete error', detail: err.stack}]});
        }

        return res.status(200).json(data);
    });
})

module.exports = router;