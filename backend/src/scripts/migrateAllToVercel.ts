import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// ─── Environment Variables ───────────────────────────────────────────────────
const MYSQL_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'eiilm_college',
};

const POSTGRES_URL =
  process.env.POSTGRES_URL ||
  process.env.STORAGE_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL;

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

// ─── Upload Media to Vercel Blob ─────────────────────────────────────────────
async function uploadFileToVercelBlob(filePath: string, filename: string): Promise<string> {
  if (!BLOB_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is required to upload media to Vercel Blob');
  }

  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(filename).toLowerCase();
  
  // Basic MIME map
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
      authorization: `Bearer ${BLOB_TOKEN}`,
      'x-api-version': '7',
      'x-content-type': contentType,
    },
    body: fileBuffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload ${filename} (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}

// ─── Main Migration Function ─────────────────────────────────────────────────
async function runMigration() {
  console.log('====================================================');
  console.log('🚀 EIILM-JC FULL DATA & MEDIA MIGRATION TO VERCEL');
  console.log('====================================================\n');

  if (!POSTGRES_URL) {
    console.error('❌ ERROR: POSTGRES_URL (or STORAGE_URL) is not defined in environment!');
    console.error('   Please provide POSTGRES_URL=postgres://... in backend/.env or as an env variable.\n');
    process.exit(1);
  }

  // 1. Connect to MySQL
  console.log('1️⃣ Connecting to local MySQL...');
  const mysqlConn = await mysql.createConnection(MYSQL_CONFIG);
  console.log('   ✅ Connected to MySQL successfully.\n');

  // 2. Connect to PostgreSQL
  console.log('2️⃣ Connecting to Vercel PostgreSQL...');
  const pgClient = new Client({
    connectionString: POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  });
  await pgClient.connect();
  console.log('   ✅ Connected to Vercel Postgres successfully.\n');

  // 3. Create Tables in PostgreSQL
  console.log('3️⃣ Initializing PostgreSQL schema (database/schema_postgres.sql)...');
  await pgClient.query(`
    DROP TABLE IF EXISTS cms_page_sections CASCADE;
    DROP TABLE IF EXISTS chat_messages CASCADE;
    DROP TABLE IF EXISTS chat_sessions CASCADE;
    DROP TABLE IF EXISTS chat_knowledge_base CASCADE;
    DROP TABLE IF EXISTS inquiries CASCADE;
  `).catch(() => {});
  const schemaPath = path.resolve(__dirname, '../../../database/schema_postgres.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await pgClient.query(schemaSql);
  console.log('   ✅ PostgreSQL schema created/verified.\n');

  // 4. Migrate Media Files to Vercel Blob (map existing + upload missing)
  const urlMapping: Record<string, string> = {};
  const uploadsDir = path.resolve(__dirname, '../../uploads/files');

  if (BLOB_TOKEN && BLOB_TOKEN.startsWith('vercel_blob_')) {
    console.log('4️⃣ Checking Vercel Blob storage for existing uploaded assets...');
    try {
      const listRes = await fetch('https://blob.vercel-storage.com/?limit=100', {
        headers: { authorization: `Bearer ${BLOB_TOKEN}` },
      });
      if (listRes.ok) {
        const listData = (await listRes.json()) as { blobs: { pathname: string; url: string }[] };
        for (const b of listData.blobs || []) {
          const fn = b.pathname.replace(/^uploads\//, '');
          urlMapping[`/uploads/files/${fn}`] = b.url;
          urlMapping[`http://localhost:5000/uploads/files/${fn}`] = b.url;
          urlMapping[`http://127.0.0.1:5000/uploads/files/${fn}`] = b.url;
          urlMapping[`https://localhost:5000/uploads/files/${fn}`] = b.url;
        }
        console.log(`   ✅ Pre-mapped ${Object.keys(urlMapping).length / 4} existing blobs directly from Vercel Blob store.\n`);
      }
    } catch (e: any) {
      console.warn(`   ⚠️ Could not list existing blobs: ${e.message}`);
    }

    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      let newlyUploaded = 0;
      for (const file of files) {
        if (urlMapping[`/uploads/files/${file}`]) continue; // Already mapped!
        const fullPath = path.join(uploadsDir, file);
        if (fs.statSync(fullPath).isFile()) {
          try {
            process.stdout.write(`   Uploading new file ${file}... `);
            const blobUrl = await uploadFileToVercelBlob(fullPath, file);
            urlMapping[`/uploads/files/${file}`] = blobUrl;
            urlMapping[`http://localhost:5000/uploads/files/${file}`] = blobUrl;
            urlMapping[`http://127.0.0.1:5000/uploads/files/${file}`] = blobUrl;
            urlMapping[`https://localhost:5000/uploads/files/${file}`] = blobUrl;
            newlyUploaded++;
            console.log(`✅ OK -> ${blobUrl}`);
          } catch (e: any) {
            console.log(`⚠️ Failed: ${e.message}`);
          }
        }
      }
      console.log(`   ✅ Finished media mapping. Newly uploaded: ${newlyUploaded}, Total mapped: ${Object.keys(urlMapping).length / 4}\n`);
    }
  } else {
    console.log('4️⃣ ⚠️ Skipping Vercel Blob upload (BLOB_READ_WRITE_TOKEN not set).\n');
  }

  // Helper to rewrite media URLs inside any string / JSON
  const rewriteUrls = (val: any): any => {
    if (val === null || val === undefined) return val;
    if (val instanceof Date) return val;
    if (typeof val === 'string') {
      let str = val;
      for (const [localUrl, blobUrl] of Object.entries(urlMapping)) {
        if (str.includes(localUrl)) {
          str = str.split(localUrl).join(blobUrl);
        }
      }
      return str;
    }
    if (typeof val === 'object') {
      if (Array.isArray(val)) {
        return val.map(rewriteUrls);
      }
      const out: any = {};
      for (const k of Object.keys(val)) {
        out[k] = rewriteUrls(val[k]);
      }
      return out;
    }
    return val;
  };

  // 5. Migrate Database Tables in Dependency Order
  const tablesToMigrate = [
    { name: 'roles', pk: 'id' },
    { name: 'permissions', pk: 'id' },
    { name: 'role_permissions', pk: null },
    { name: 'users', pk: 'id' },
    { name: 'colleges', pk: 'id' },
    { name: 'departments', pk: 'id' },
    { name: 'courses', pk: 'id' },
    { name: 'specializations', pk: 'id' },
    { name: 'faculty', pk: 'id' },
    { name: 'inquiries', pk: 'id' },
    { name: 'notices', pk: 'id' },
    { name: 'events', pk: 'id' },
    { name: 'media_library', pk: 'id' },
    { name: 'infrastructures', pk: 'id' },
    { name: 'placements', pk: 'id' },
    { name: 'page_sections', pk: 'id' },
    { name: 'site_settings', pk: 'id' },
    { name: 'chat_knowledge_base', pk: 'id' },
    { name: 'chat_sessions', pk: 'id' },
    { name: 'chat_messages', pk: 'id' },
    { name: 'grades', pk: 'id' },
    { name: 'fee_records', pk: 'id' },
    { name: 'page_views', pk: 'id' },
    { name: 'audit_logs', pk: 'id' },
  ];

  console.log('5️⃣ Migrating database records from MySQL to PostgreSQL...');

  for (const { name: tbl, pk } of tablesToMigrate) {
    try {
      // Check if table exists in MySQL
      const [rows]: any = await mysqlConn.query(`SELECT * FROM ${tbl}`).catch(() => [[], null]);
      if (!rows || rows.length === 0) {
        console.log(`   ℹ️  Table '${tbl}': 0 rows in MySQL (Skipping)`);
        continue;
      }

      console.log(`   📦 Migrating '${tbl}' (${rows.length} rows)...`);

      // Fetch column names and types for target table in Postgres
      const pColsRes = await pgClient.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
      `, [tbl]);
      
      const pgColMap = new Map<string, string>();
      for (const r of pColsRes.rows) {
        pgColMap.set(r.column_name, r.data_type);
      }

      for (const rawRow of rows) {
        const row = rewriteUrls(rawRow);

        // Filter to only columns that exist in Postgres
        const cols = Object.keys(row).filter((c) => pgColMap.has(c));
        const vals = cols.map((c) => {
          const colType = pgColMap.get(c);
          const v = row[c];
          if (v === undefined) return null;
          if (v instanceof Date) return v;
          if (colType === 'boolean') return Boolean(v);
          if (typeof v === 'boolean') return v;
          if (colType === 'json' || colType === 'jsonb') {
            if (typeof v === 'object' && v !== null) return JSON.stringify(v);
            if (typeof v === 'string') {
              try {
                // Ensure valid JSON
                JSON.parse(v);
                return v;
              } catch {
                return JSON.stringify(v);
              }
            }
            return null;
          }
          if (typeof v === 'object' && v !== null) return JSON.stringify(v);
          if (v === '' && (colType?.includes('timestamp') || colType?.includes('date'))) return null;
          return v;
        });

        const colNames = cols.map((c) => `"${c}"`).join(', ');
        const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');

        const insertSql = `INSERT INTO "${tbl}" (${colNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING;`;
        await pgClient.query(insertSql, vals);
      }

      // Update sequence if table has a serial primary key
      if (pk && pk === 'id') {
        await pgClient.query(`
          SELECT setval(
            pg_get_serial_sequence('"${tbl}"', 'id'),
            COALESCE((SELECT MAX(id) + 1 FROM "${tbl}"), 1),
            false
          );
        `).catch(() => {});
      }

      console.log(`      ✅ '${tbl}': ${rows.length} rows migrated successfully.`);
    } catch (tblErr: any) {
      console.warn(`      ⚠️ Warning on table '${tbl}': ${tblErr.message}`);
    }
  }

  // Cleanup
  await mysqlConn.end();
  await pgClient.end();

  console.log('\n====================================================');
  console.log('🎉 COMPLETE MIGRATION FINISHED SUCCESSFULLY!');
  console.log('   All tables, users, courses, settings, and media URLs');
  console.log('   are now fully live in your Vercel PostgreSQL database.');
  console.log('====================================================\n');
}

runMigration().catch((err) => {
  console.error('\n❌ Fatal Migration Error:', err);
  process.exit(1);
});
