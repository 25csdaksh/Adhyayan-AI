const multer = require('multer');
const path = require('path');
const config = require('../config/env');
const ApiError = require('../utils/apiError');

// Memory storage keeps file buffers in memory for direct Cloudinary streaming
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  // Check against prohibited executable or script extensions
  const dangerousExtensions = ['.exe', '.sh', '.bat', '.cmd', '.js', '.php', '.py', '.rb', '.jar', '.vbs'];
  if (dangerousExtensions.includes(ext)) {
    return cb(new ApiError(400, `Executable or script files are strictly prohibited: ${ext}`), false);
  }

  const isValidExt = ALLOWED_EXTENSIONS.includes(ext);
  const isValidMime = ALLOWED_MIME_TYPES.includes(mime);

  if (isValidExt || isValidMime) {
    return cb(null, true);
  }

  return cb(
    new ApiError(
      400,
      `Unsupported file format: ${ext || mime}. Allowed formats: PDF (.pdf), Word (.docx), and Text (.txt)`
    ),
    false
  );
};

const maxSizeBytes = (config.maxFileSizeMb || 20) * 1024 * 1024;

const upload = multer({
  storage,
  limits: {
    fileSize: maxSizeBytes,
  },
  fileFilter,
});

/**
 * Express middleware wrapper to cleanly catch Multer limits and format as ApiError
 */
const uploadMiddleware = (req, res, next) => {
  const singleUpload = upload.single('file');

  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          new ApiError(
            400,
            `File exceeds the maximum allowed size limit of ${config.maxFileSizeMb}MB`
          )
        );
      }
      return next(new ApiError(400, `Upload error: ${err.message}`));
    }
    if (err) {
      return next(err);
    }
    next();
  });
};

module.exports = {
  uploadMiddleware,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
};
