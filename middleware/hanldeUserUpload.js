const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userPath = path.join(__dirname, "../uploads/");
        if (!fs.existsSync(userPath)) {
            fs.mkdirSync(userPath);
        }
        cb(null, userPath);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, uuidv4() + ext);
    },
});

const upload = multer({ storage: storage });

module.exports = upload;
