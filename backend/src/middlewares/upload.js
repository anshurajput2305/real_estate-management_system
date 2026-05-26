import multer from 'multer';
import { ApiError } from '../utils/api.js';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/') && file.mimetype !== 'application/pdf') {
      cb(new ApiError(400, 'Only images and PDF documents are allowed'));
      return;
    }
    cb(null, true);
  }
});
