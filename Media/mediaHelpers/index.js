
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
    } else if (req.body.businessid) {
        cb(null, `lbo-media/${req.body.businessid}`);
    } else if (req.body.categoryid) {
        cb(null, 'lbo-images/categories');
    }
};
  
const key = function (req, file, cb) {
    if (req.body.userid) {
        cb(null, req.body.userid);
    } else if (req.body.businessid) {
        cb(null, req.body.businessid + Date.now().toString());
    } else if (req.body.categoryid) {
        cb(null, req.body.categoryid);
    }
};

const getBucketKey = (string) => {
    const [a , b] = string.split('https://');
    const [ Bucket, Key ]= b.split('.s3.us-west-1.amazonaws.com/');

    return { Bucket, Key };
}

const getBucketKeysMulti = (arr) => {
    return arr.reduce((deleteArray, obj) => {
        const keys = getBucketKey(obj.location)
        deleteArray.push({Key: keys.Key})
        return deleteArray;
    }, [])
}

  module.exports = {
      fileFilter,
      bucket,
      key,
      getBucketKey,
      getBucketKeysMulti
  }