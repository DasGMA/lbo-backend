const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const config = require('../config');

aws.config.update({
  secretAccessKey: config.AWS_SECRET_ACCESS,
  accessKeyId: config.AWS_ACCESS_KEY,
  region: 'us-west-1'
});

const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true)
  } else {
      cb(new Error('Invalid Mime Type, only JPEG and PNG'), false);
  }
}

const upload = multer({
  fileFilter,
  storage: multerS3({
    s3,
    bucket: function (req, file, cb) {
        if (require.body.userid) {
            cb(null, 'lbo-images/avatars');
        } else if (req.body.businessName) {
            cb(null, `lbo-media/${req.body.businessName}`);
        }
      },
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, {'uploaded-file': file.originalname});
    },
    key: function (req, file, cb) {
        if (req.body.userid) {
            cb(null, req.body.userid);
        } else if (req.body.businessName) {
            cb(null, req.body.businessName + Date.now().toString());
        }
    }
  })
})

module.exports = upload;

