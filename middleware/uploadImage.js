const path = require("path");
const fs = require("fs");
const multer = require("multer");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

const ensureDir = (dir, cb) => {
  fs.mkdir(dir, { recursive: true }, (err) => cb(err));
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureDir(UPLOAD_DIR, (err) => cb(err, UPLOAD_DIR));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const name = `user_${req.user?.id || "anon"}_${Date.now()}${ext.toLowerCase()}`;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  const ok = /^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype);
  if (!ok) return cb(new Error("Only image files (png/jpg/jpeg/webp/gif) are allowed"), false);
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

module.exports = upload;

