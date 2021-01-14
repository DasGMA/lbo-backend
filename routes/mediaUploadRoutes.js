const express = require("express");
const router = express.Router();
const upload = require('../Media-upload');

const auth = require('../Authorization/index');

const protected = auth.protected;

const singleUpload = upload.fields([
    {name: 'image', maxCount: 1}]);
const multiUpload = upload.array('image');

router.route('/avatar-upload').post(singleUpload, function(req, res) {
    // singleUpload(req, res, function(err) {
    //     //console.log(req.files)
    //     //console.log(req.body)
    //     if (err) {
    //       return res.status(422).send({errors: [{title: 'File Upload Error', detail: err.message}] });
    //     }
    console.log(req.body)
         return res.status(200).json({'imageUrl': req.files.image[0].location});
    //   });
});

module.exports = router;