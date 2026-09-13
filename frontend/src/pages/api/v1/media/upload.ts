import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File as FormidableFile } from 'formidable';
import { queryDb } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

// Disable Next.js default body parser so we can parse stream with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // 1. Authenticate Token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  let userId = 1;
  try {
    const decoded = verifyAccessToken(authHeader.split(' ')[1]);
    userId = decoded.id;
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // 2. Parse Form Data using formidable
  const form = formidable({ multiples: false, keepExtensions: true });

  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Formidable Error:', err);
        res.status(500).json({ success: false, message: 'Error parsing form data' });
        return resolve(null);
      }

      // Check if file is provided
      const fileField = files.file;
      if (!fileField) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return resolve(null);
      }

      const file: FormidableFile = Array.isArray(fileField) ? fileField[0] : fileField;
      if (!file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return resolve(null);
      }

      try {
        // Read file buffer
        const buffer = fs.readFileSync(file.filepath);
        const originalName = file.originalFilename || 'unnamed_file';
        const ext = path.extname(originalName);
        const basename = path.basename(originalName, ext).toLowerCase().replace(/[^a-z0-9_-]/g, '_');
        const mimeType = file.mimetype || 'application/octet-stream';
        
        let finalUrl = '';
        const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

        if (blobToken && blobToken.startsWith('vercel_blob_')) {
          // Upload to Vercel Blob
          const pathname = `uploads/${basename}_${Date.now()}${ext}`;
          
          const response = await fetch(
            `https://blob.vercel-storage.com/${pathname}?access=public`,
            {
              method: 'PUT',
              headers: {
                authorization: `Bearer ${blobToken}`,
                'x-api-version': '7',
                'x-content-type': mimeType,
              },
              body: buffer,
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Vercel Blob upload failed (${response.status}): ${errorText}`);
          }

          const result = await response.json();
          finalUrl = result.url;
        } else {
          // Fallback to local upload (only for dev, won't persist on Vercel)
          const uploadDir = path.join(process.cwd(), 'public', 'uploads');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          const localFilename = `${basename}_${Date.now()}${ext}`;
          const finalPath = path.join(uploadDir, localFilename);
          fs.copyFileSync(file.filepath, finalPath);
          finalUrl = `/uploads/${localFilename}`;
        }

        // Clean up temp file
        try { fs.unlinkSync(file.filepath); } catch (e) {}

        // 3. Save to database
        const dbResult = await queryDb(
          `INSERT INTO media_library 
           (file_name, file_type, file_size, file_url, uploaded_by, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id`,
          [basename + ext, mimeType, file.size, finalUrl, userId]
        );

        const mediaId = dbResult[0]?.id;

        res.status(200).json({
          success: true,
          message: 'File uploaded successfully',
          data: {
            id: Number(mediaId),
            url: finalUrl,
            path: finalUrl,
            filename: basename + ext,
            originalName: originalName,
            size: file.size,
            mimetype: mimeType,
          }
        });
        return resolve(null);

      } catch (uploadErr: any) {
        console.error('Upload Error:', uploadErr);
        res.status(500).json({ success: false, message: uploadErr.message || 'Failed to upload photo' });
        return resolve(null);
      }
    });
  });
}
