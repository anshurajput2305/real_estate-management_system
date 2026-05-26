import { Readable } from 'node:stream';
import cloudinary from '../config/cloudinary.js';
import { ApiError } from '../utils/api.js';

export const uploadBufferToCloudinary = async (file, folder = 'rems') => {
  if (!cloudinary.config().cloud_name) {
    throw new ApiError(503, 'Cloudinary is not configured');
  }

  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image',
        public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9-_]/gi, '-')}`
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve({ url: result.secure_url, publicId: result.public_id, name: file.originalname });
      }
    );

    Readable.from(file.buffer).pipe(upload);
  });
};
