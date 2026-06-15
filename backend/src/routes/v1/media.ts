import { Router } from 'express';
import { uploadCloud, getUploadedFileUrl } from '@middlewares/uploadCloud';
import { authenticateToken, authorizePermission } from '@middlewares/auth';
import { ApiResponse } from '@utils/responses';
import { Request, Response } from 'express';
import { MediaLibrary } from '@models/MediaLibrary';
import { parsePagination } from '@utils/pagination';
import cloudinary from 'cloudinary';
import fs from 'fs';
import path from 'path';

const router = Router();

// GET /api/v1/media
router.get(
  '/',
  authenticateToken,
  authorizePermission('media', 'read'),
  async (req: Request, res: Response) => {
    try {
      const { page, limit } = parsePagination(req.query.page, req.query.limit);
      const offset = (page - 1) * limit;
      const result = await MediaLibrary.findAndCountAll({
        order: [['id', 'DESC']],
        limit,
        offset,
      });
      ApiResponse.paginated(res, 200, 'Media fetched successfully', result.rows, {
        page,
        limit,
        total: result.count,
        totalPages: Math.ceil(result.count / limit),
      });
    } catch (error: any) {
      ApiResponse.error(res, 500, error.message || 'Failed to fetch media');
    }
  }
);

// POST /api/v1/media/upload
// Automatically uses Cloudinary if configured, otherwise local disk.
router.post(
  '/upload',
  authenticateToken,
  authorizePermission('media', 'write'),
  uploadCloud.single('file'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        ApiResponse.error(res, 400, 'No file uploaded');
        return;
      }

      // Works for both Cloudinary (https:// URL) and local disk (/uploads/files/...)
      const fileUrl = getUploadedFileUrl(req.file);

      const media = await MediaLibrary.create({
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileUrl,
        fileSize: req.file.size,
      });

      ApiResponse.success(res, 200, 'File uploaded successfully', {
        id: media.id,
        url: fileUrl,
        path: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });
    } catch (error: any) {
      ApiResponse.error(res, 500, error.message || 'Upload failed');
    }
  }
);

// PUT /api/v1/media/:id/replace
router.put(
  '/:id/replace',
  authenticateToken,
  authorizePermission('media', 'write'),
  uploadCloud.single('file'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        ApiResponse.error(res, 400, 'No new file uploaded');
        return;
      }

      const mediaId = Number(req.params.id);
      const media = await MediaLibrary.findByPk(mediaId);

      if (!media) {
        ApiResponse.error(res, 404, 'Media not found');
        return;
      }

      const newFileUrl = getUploadedFileUrl(req.file);

      // Delete the old file (Cloudinary or local)
      if (media.fileUrl && media.fileUrl.startsWith('https://res.cloudinary.com')) {
        const publicIdMatch = media.fileUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
        if (publicIdMatch) {
          try { await cloudinary.v2.uploader.destroy(publicIdMatch[1]); } catch (_) { /* non-fatal */ }
        }
      } else {
        const oldFilenameMatch = media.fileUrl.match(/\/uploads\/files\/(.+)$/);
        if (oldFilenameMatch) {
          const oldPhysicalPath = path.join(__dirname, '../../../uploads/files', oldFilenameMatch[1]);
          if (fs.existsSync(oldPhysicalPath)) fs.unlinkSync(oldPhysicalPath);
        }
      }

      // Update the DB record with new file info
      await media.update({
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        fileUrl: newFileUrl,
      });

      ApiResponse.success(res, 200, 'File replaced globally', media);
    } catch (error: any) {
      ApiResponse.error(res, 500, error.message || 'Replace failed');
    }
  }
);

// DELETE /api/v1/media/:id
router.delete(
  '/:id',
  authenticateToken,
  authorizePermission('media', 'delete'),
  async (req: Request, res: Response) => {
    try {
      const media = await MediaLibrary.findByPk(Number(req.params.id));
      if (!media) {
        ApiResponse.error(res, 404, 'Media not found');
        return;
      }

      // Delete from Cloudinary if it's a Cloudinary URL
      if (media.fileUrl && media.fileUrl.startsWith('https://res.cloudinary.com')) {
        const publicIdMatch = media.fileUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
        if (publicIdMatch) {
          try {
            await cloudinary.v2.uploader.destroy(publicIdMatch[1]);
          } catch (cloudErr) {
            console.warn('Cloudinary delete warning:', cloudErr);
          }
        }
      } else {
        // Local disk
        const filenameMatch = media.fileUrl.match(/\/uploads\/files\/(.+)$/);
        if (filenameMatch) {
          const physicalPath = path.join(__dirname, '../../../uploads/files', filenameMatch[1]);
          if (fs.existsSync(physicalPath)) fs.unlinkSync(physicalPath);
        }
      }

      await media.destroy();
      ApiResponse.success(res, 200, 'Media deleted');
    } catch (error: any) {
      ApiResponse.error(res, 500, error.message || 'Delete failed');
    }
  }
);

export default router;
