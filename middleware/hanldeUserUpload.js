const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userId = req.user.id;
        const userPath = path.join(__dirname, "../uploads/");
        if (!fs.existsSync(userPath)) {
            fs.mkdirSync(userPath);
        }
        cb(null, userPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage: storage });

module.exports = upload;
