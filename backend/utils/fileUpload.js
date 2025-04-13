// backend/utils/fileUpload.js
const multer = require('multer');
const path = require('path');

// Disk storage configuration (ensure an 'uploads' folder exists)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Make sure to create this directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (!ext.match(/\.(jpg|jpeg|png|pdf|doc|docx)$/i)) {
      return cb(new Error('File type not allowed'), false);
    }
    cb(null, true);
  },
});

module.exports = upload;
