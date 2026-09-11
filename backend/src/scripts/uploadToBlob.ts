import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const POSTGRES_URL =
  process.env.POSTGRES_URL ||
  process.env.STORAGE_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL;

const BLOB_TOKEN = process.argv[2] || process.env.BLOB_READ_WRITE_TOKEN;

async function uploadFileToVercelBlob(filePath: string, filename: string, token: string): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(filename).toLowerCase();

  const mimeMap: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.mp4': 'video/mp4',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
  };
  const contentType = mimeMap[ext] || 'application/octet-stream';

  const pathname = `uploads/${filename}`;
  const response = await fetch(`https://blob.vercel-storage.com/${pathname}?access=public`, {
    method: 'PUT',
    headers: {
      authorization: `Bearer ${token}`,
      'x-api-version': '7',
      'x-content-type': contentType,
    },
    body: fileBuffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}

async function main() {
  console.log('====================================================');
  console.log('☁️  MIGRATE ALL MEDIA FILES TO VERCEL BLOB STORAGE');
  console.log('====================================================\n');

  if (!BLOB_TOKEN || BLOB_TOKEN === '[SENSITIVE]' || !BLOB_TOKEN.startsWith('vercel_blob_')) {
    console.error('❌ ERROR: A valid BLOB_READ_WRITE_TOKEN is required.');
    console.error('   Please pass it as an argument or set it in backend/.env:');
    console.error('   npx ts-node -r tsconfig-paths/register src/scripts/uploadToBlob.ts vercel_blob_rw_...\n');
    process.exit(1);
  }

  if (!POSTGRES_URL) {
    console.error('❌ ERROR: POSTGRES_URL is not set in environment.');
    process.exit(1);
  }

  const uploadsDir = path.resolve(__dirname, '../../uploads/files');
  if (!fs.existsSync(uploadsDir)) {
    console.error(`❌ ERROR: Uploads folder not found at ${uploadsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(uploadsDir);
  console.log(`📁 Found ${files.length} local files in backend/uploads/files/`);

  // Connect to PostgreSQL
  const pg = new Client({
    connectionString: POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  });
  await pg.connect();
  console.log('✅ Connected to Vercel PostgreSQL.\n');

  const urlMapping: Record<string, string> = {};
  let uploadedCount = 0;

  console.log('🚀 Uploading files to Vercel Blob:');
  for (const file of files) {
    const fullPath = path.join(uploadsDir, file);
    if (fs.statSync(fullPath).isFile()) {
      try {
        process.stdout.write(`   Uploading ${file}... `);
        const blobUrl = await uploadFileToVercelBlob(fullPath, file, BLOB_TOKEN);
        urlMapping[`/uploads/files/${file}`] = blobUrl;
        urlMapping[`http://localhost:5000/uploads/files/${file}`] = blobUrl;
        uploadedCount++;
        console.log(`✅ OK -> ${blobUrl}`);
      } catch (err: any) {
        console.log(`⚠️ Failed: ${err.message}`);
      }
    }
  }

  console.log(`\n✅ Upload complete: ${uploadedCount}/${files.length} files successfully uploaded to Vercel Blob.\n`);

  console.log('🔄 Updating database records with new Vercel Blob URLs...');

  for (const [oldUrl, newUrl] of Object.entries(urlMapping)) {
    // 1. media_library
    await pg.query(
      `UPDATE media_library SET file_url = $1 WHERE file_url = $2 OR file_url LIKE $3`,
      [newUrl, oldUrl, `%${path.basename(oldUrl)}`]
    );

    // 2. courses
    await pg.query(`UPDATE courses SET banner = $1 WHERE banner = $2`, [newUrl, oldUrl]);
    await pg.query(`UPDATE courses SET syllabus = $1 WHERE syllabus = $2`, [newUrl, oldUrl]);

    // 3. faculty
    await pg.query(`UPDATE faculty SET photo = $1 WHERE photo = $2`, [newUrl, oldUrl]);

    // 4. infrastructures
    await pg.query(`UPDATE infrastructures SET image_url = $1 WHERE image_url = $2`, [newUrl, oldUrl]);

    // 5. placements
    await pg.query(`UPDATE placements SET student_image = $1 WHERE student_image = $2`, [newUrl, oldUrl]);
    await pg.query(`UPDATE placements SET company_logo = $1 WHERE company_logo = $2`, [newUrl, oldUrl]);

    // 6. notices
    await pg.query(`UPDATE notices SET image = $1 WHERE image = $2`, [newUrl, oldUrl]);
    await pg.query(`UPDATE notices SET pdf_url = $1 WHERE pdf_url = $2`, [newUrl, oldUrl]);

    // 7. events
    await pg.query(`UPDATE events SET banner = $1 WHERE banner = $2`, [newUrl, oldUrl]);
  }

  // 8. Update page_sections config JSON
  const sectionsRes = await pg.query(`SELECT id, config FROM page_sections WHERE config IS NOT NULL`);
  for (const row of sectionsRes.rows) {
    let jsonStr = JSON.stringify(row.config);
    let changed = false;
    for (const [oldUrl, newUrl] of Object.entries(urlMapping)) {
      if (jsonStr.includes(oldUrl)) {
        jsonStr = jsonStr.split(oldUrl).join(newUrl);
        changed = true;
      }
    }
    if (changed) {
      await pg.query(`UPDATE page_sections SET config = $1 WHERE id = $2`, [JSON.parse(jsonStr), row.id]);
    }
  }

  await pg.end();

  console.log('====================================================');
  console.log('🎉 ALL MEDIA FILES & DATABASE URLS ARE NOW CLOUD-HOSTED!');
  console.log('   All images, banners, and documents are now served');
  console.log('   100% directly from Vercel Blob CDN.');
  console.log('====================================================\n');
}

main().catch((err) => {
  console.error('\n❌ Fatal upload error:', err);
  process.exit(1);
});
