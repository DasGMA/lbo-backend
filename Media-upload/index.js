const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { fileFilter, bucket, key } = require('./mediaHelpers');

const config = require('../config');

aws.config.update({
  secretAccessKey: config.AWS_SECRET_ACCESS,
  accessKeyId: config.AWS_ACCESS_KEY,
  region: 'us-west-1'
});

const s3 = new aws.S3();

const upload = multer({
  fileFilter,
  storage: multerS3({
    s3,
    bucket,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, {'uploaded-file': file.originalname});
    },
    key
  })
});

module.exports = {
  upload,
  s3
};

