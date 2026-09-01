const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');
const { BadRequestError } = require('../utils/errors');

if (!fs.existsSync(config.UPLOAD_DIR)) {
  fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const sanitizedOriginal = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}_${sanitizedOriginal}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (config.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        `Invalid file type '${file.mimetype}'. Allowed file formats: PDF, Word, Excel, Images (PNG/JPG), CSV, Plain Text.`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: config.MAX_FILE_SIZE },
  fileFilter
});

module.exports = upload;
