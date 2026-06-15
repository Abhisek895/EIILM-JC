import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/files');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_'); // Sanitize filename to alphanumeric and underscores only
    const timestamp = Date.now();
    cb(null, `${basename}_${timestamp}${ext}`);
  }
});

export const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB maximum size limit
});
