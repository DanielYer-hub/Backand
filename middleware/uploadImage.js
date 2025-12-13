const multer = require("multer");

const fileFilter = (_req, file, cb) => {
  const ok = /^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype);
  if (!ok) return cb(new Error("Only image files (png/jpg/jpeg/webp/gif) are allowed"), false);
  cb(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});




module.exports = upload;

