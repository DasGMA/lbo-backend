const MulterGridfsStorage = require("multer-gridfs-storage");
const multer = require("multer");

const storage = new MulterGridfsStorage({
    url: "mongodb://localhost:27017",
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = file.originalname;
                const fileInfo = {
                    filename: filename,
                    bucketName: "Photos",
                };
                resolve(fileInfo);
            });
        });
    },
});

const upload = multer({ storage });

module.exports = upload;
