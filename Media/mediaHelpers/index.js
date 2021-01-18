const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(new Error('Invalid Mime Type, only JPEG and PNG'), false);
    }
  };
  
const bucket = function (req, file, cb) {
    if (req.body.userid) {
        cb(null, 'lbo-images/avatars');
    } else if (req.body.businessName) {
        cb(null, `lbo-media/${req.body.businessName}`);
    } else if (req.body.categoryid) {
        cb(null, 'lbo-images/categories');
    }
};
  
const key = function (req, file, cb) {
    if (req.body.userid) {
        cb(null, req.body.userid);
    } else if (req.body.businessName) {
        cb(null, req.body.businessName + Date.now().toString());
    } else if (req.body.categoryid) {
        cb(null, req.body.categoryid)
    }
};

const getBucketKey = (string) => {
    console.log({string})
    const [a , b] = string.split('https://');
    const [ Bucket, Key ]= b.split('.s3.us-west-1.amazonaws.com/');
    console.log({Bucket, Key})
    return { Bucket, Key };
}

  module.exports = {
      fileFilter,
      bucket,
      key,
      getBucketKey
  }