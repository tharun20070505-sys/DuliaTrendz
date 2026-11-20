import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';

// Setup local uploads directory
const uploadDir = path.resolve(process.cwd(), 'uploads');

// Memory storage for direct cloudinary stream or disk storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|avif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp, avif) are allowed!'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter,
});

/**
 * Upload buffer to Cloudinary or save locally if Cloudinary is not configured
 */
export const uploadImageToService = async (fileBuffer, originalname, folder = 'dulia-trenz') => {
  if (isCloudinaryConfigured()) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      );
      stream.end(fileBuffer);
    });
  }

  if (process.env.VERCEL) {
    throw new Error('Cloudinary must be configured for uploads on Vercel');
  }

  // Local fallback
  fs.mkdirSync(uploadDir, { recursive: true });
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = path.extname(originalname) || '.jpg';
  const filename = `img-${uniqueSuffix}${ext}`;
  const filepath = path.join(uploadDir, filename);

  fs.writeFileSync(filepath, fileBuffer);

  return {
    url: `/uploads/${filename}`,
    public_id: filename,
  };
};
