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

// ─── Detect Storage Provider ──────────────────────────────────────────────────
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
const API_KEY = process.env.CLOUDINARY_API_KEY || '';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

const isCloudinaryConfigured =
  CLOUD_NAME && CLOUD_NAME !== 'your_cloud_name_here' &&
  API_KEY && API_KEY !== 'your_api_key_here' &&
  API_SECRET && API_SECRET !== 'your_api_secret_here';

const isVercelBlobConfigured = Boolean(
  process.env.BLOB_READ_WRITE_TOKEN &&
  process.env.BLOB_READ_WRITE_TOKEN.startsWith('vercel_blob_')
);

// ─── Vercel Blob Storage Engine ───────────────────────────────────────────────
class VercelBlobStorage implements StorageEngine {
  _handleFile(
    _req: any,
    file: Express.Multer.File,
    cb: (error?: any, info?: Partial<Express.Multer.File>) => void
  ): void {
    try {
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext)
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '_');
      const pathname = `uploads/${basename}_${Date.now()}${ext}`;

      const chunks: Buffer[] = [];
      file.stream.on('data', (chunk) => chunks.push(chunk));
      file.stream.on('error', (err) => cb(err));
      file.stream.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);
          const response = await fetch(
            `https://blob.vercel-storage.com/${pathname}?access=public`,
            {
              method: 'PUT',
              headers: {
                authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
                'x-api-version': '7',
                'x-content-type': file.mimetype || 'application/octet-stream',
              },
              body: buffer,
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            return cb(new Error(`Vercel Blob upload failed (${response.status}): ${errorText}`));
          }

          const result = (await response.json()) as { url: string; pathname: string };
          cb(null, {
            path: result.url,
            filename: result.pathname || pathname,
            size: buffer.length,
          });
        } catch (uploadErr) {
          cb(uploadErr);
        }
      });
    } catch (err) {
      cb(err);
    }
  }

  _removeFile(
    _req: any,
    _file: Express.Multer.File,
    cb: (error: Error | null) => void
  ): void {
    cb(null);
  }
}

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
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext)
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '_');
      cb(null, `${basename}_${Date.now()}${ext}`);
    },
  });

// ─── Build the appropriate storage engine ────────────────────────────────────
let storage: StorageEngine;

if (isVercelBlobConfigured) {
  storage = new VercelBlobStorage();
  console.log('📦 Upload storage: Vercel Blob Storage');
} else if (isCloudinaryConfigured) {
  try {
    cloudinary.v2.config({
      cloud_name: CLOUD_NAME,
      api_key: API_KEY,
      api_secret: API_SECRET,
    });

    storage = new CloudinaryStorage({
      cloudinary: cloudinary.v2,
      params: async (_req, file) => {
        const isVideo = file.mimetype.startsWith('video/');
        const isRaw = file.mimetype === 'application/pdf'
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
    '   Set BLOB_READ_WRITE_TOKEN (for Vercel Blob) or CLOUDINARY_* in backend/.env\n' +
    '   to switch to permanent cloud storage.'
  );
}

const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif',
  '.mp4', '.webm', '.pdf', '.doc', '.docx', '.txt',
]);

const ALLOWED_MIME_PREFIXES = ['image/', 'video/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument', 'text/plain'];

// ─── Exported multer instance ─────────────────────────────────────────────────
export const uploadCloud = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    // Explicitly reject executable / script / stored XSS extensions
    const dangerousExts = ['.exe', '.sh', '.bat', '.cmd', '.php', '.html', '.htm', '.svg', '.js', '.jsx', '.ts', '.tsx', '.cgi', '.pl'];
    if (dangerousExts.includes(ext)) {
      return cb(new Error('File upload rejected: dangerous or executable file extension detected.'));
    }

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new Error(`File upload rejected: extension '${ext}' is not permitted.`));
    }

    const mimeAllowed = ALLOWED_MIME_PREFIXES.some(prefix => file.mimetype.startsWith(prefix) || file.mimetype === prefix);
    if (!mimeAllowed) {
      return cb(new Error(`File upload rejected: MIME type '${file.mimetype}' is not permitted.`));
    }

    cb(null, true);
  },
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

/**
 * Cleanly deletes a file from whatever storage provider it was uploaded to:
 * - Vercel Blob (using REST delete endpoint)
 * - Cloudinary (using uploader.destroy)
 * - Local disk (using fs.unlinkSync)
 */
export async function deleteRemoteFile(fileUrl: string | null | undefined): Promise<void> {
  if (!fileUrl) return;

  // 1. Vercel Blob Storage
  if (fileUrl.includes('blob.vercel-storage.com')) {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        await fetch('https://blob.vercel-storage.com/delete', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
            'x-api-version': '7',
            'content-type': 'application/json',
          },
          body: JSON.stringify({ urls: [fileUrl] }),
        });
      } catch (blobErr) {
        console.warn('Vercel Blob delete warning:', blobErr);
      }
    }
    return;
  }

  // 2. Cloudinary Storage
  if (fileUrl.startsWith('https://res.cloudinary.com')) {
    const publicIdMatch = fileUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    if (publicIdMatch) {
      try {
        await cloudinary.v2.uploader.destroy(publicIdMatch[1]);
      } catch (cloudErr) {
        console.warn('Cloudinary delete warning:', cloudErr);
      }
    }
    return;
  }

  // 3. Local Disk Storage
  const filenameMatch = fileUrl.match(/\/uploads\/files\/(.+)$/);
  if (filenameMatch) {
    const physicalPath = path.join(__dirname, '../../uploads/files', filenameMatch[1]);
    if (fs.existsSync(physicalPath)) {
      try {
        fs.unlinkSync(physicalPath);
      } catch (diskErr) {
        console.warn('Local disk delete warning:', diskErr);
      }
    }
  }
}
