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
})

router.route('/delete-single-file').post(async (req, res) => {
    const { imageUrl, userid } = req.body;
    const s3Params = getBucketKey(imageUrl);

    try {
        const data = await s3.deleteObject(s3Params).promise();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(422).send({errors: [{title: 'File delete error', detail: error.stack}]});
    }

    // s3.deleteObject(s3Params, (err, data) => {
    //     if (err) {
    //         return res.status(422).send({errors: [{title: 'File delete error', detail: err.stack}]});
    //     }

    //     return res.status(200).json(data);
    // });
})



module.exports = router;