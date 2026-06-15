/**
 * Smart upload middleware — auto-detects storage backend.
 *
 * ▸ If CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET are all set in .env
 *   → uploads go to Cloudinary CDN (permanent, survives restarts)
 *   → req.file.path = full https:// CDN URL  (store this in DB)
 *
 * ▸ Otherwise (credentials missing / placeholder)
 *   → falls back to local disk  backend/uploads/files/
 *   → use req.file.filename to build the /uploads/files/<name> relative URL
 *
 * Routes should call getUploadedFileUrl(req.file) to get the correct URL
 * to store in the database regardless of which backend is active.
 */

import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer, { StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';

// ─── Detect whether Cloudinary is configured ─────────────────────────────────
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
const API_KEY    = process.env.CLOUDINARY_API_KEY    || '';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

const isCloudinaryConfigured =
  CLOUD_NAME && CLOUD_NAME !== 'your_cloud_name_here' &&
  API_KEY    && API_KEY    !== 'your_api_key_here'    &&
  API_SECRET && API_SECRET !== 'your_api_secret_here';

// ─── Local disk fallback ──────────────────────────────────────────────────────
const buildLocalDiskStorage = (): StorageEngine =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const uploadPath = path.join(__dirname, '../../uploads/files');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
      const ext      = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext)
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '_');
      cb(null, `${basename}_${Date.now()}${ext}`);
    },
  });

// ─── Build the appropriate storage engine ────────────────────────────────────
let storage: StorageEngine;

if (isCloudinaryConfigured) {
  try {
    cloudinary.v2.config({
      cloud_name: CLOUD_NAME,
      api_key:    API_KEY,
      api_secret: API_SECRET,
    });

    storage = new CloudinaryStorage({
      cloudinary: cloudinary.v2,
      params: async (_req, file) => {
        const isVideo = file.mimetype.startsWith('video/');
        const isRaw   = file.mimetype === 'application/pdf'
                     || file.mimetype.startsWith('application/');
        return {
          folder: 'eiilm-jc',
          resource_type: isVideo ? 'video' : isRaw ? 'raw' : 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg',
                            'mp4', 'webm', 'pdf', 'doc', 'docx'],
          public_id: file.originalname
            .replace(/\.[^.]+$/, '')
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, '_')
            + '_' + Date.now(),
        };
      },
    }) as any;

    console.log('📦 Upload storage: Cloudinary CDN');
  } catch (e) {
    console.warn('⚠️  Cloudinary init failed, falling back to local disk:', e);
    storage = buildLocalDiskStorage();
    console.warn('⚠️  Upload storage: LOCAL DISK');
  }
} else {
  storage = buildLocalDiskStorage();
  console.warn(
    '⚠️  Upload storage: LOCAL DISK (images will be lost on server restart!).\n' +
    '   Set CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET in backend/.env\n' +
    '   to switch to permanent Cloudinary storage.'
  );
}

// ─── Exported multer instance ─────────────────────────────────────────────────
export const uploadCloud = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

/**
 * Call this in your route handler after uploadCloud.single('file') to get
 * the URL/path to store in the database — works for both Cloudinary and local.
 *
 * @example
 *   const fileUrl = getUploadedFileUrl(req.file);
 *   // Cloudinary: "https://res.cloudinary.com/..."
 *   // Local:      "/uploads/files/myimage_1234567890.jpg"
 */
export const getUploadedFileUrl = (file: Express.Multer.File): string => {
  if (!file) return '';
  // Cloudinary storage sets file.path to the full https:// URL
  if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
    return file.path;
  }
  // Local disk storage — build the relative URL the frontend can resolve
  return `/uploads/files/${file.filename}`;
};
