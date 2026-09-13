import type { NextApiRequest, NextApiResponse } from "next";
import { formidable } from "formidable";
import type { File as FormidableFile } from "formidable";
import { queryDb } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";
import fs from "fs";
import path from "path";

// Must disable Next.js body parser so formidable can read the raw stream
export const config = {
  api: { bodyParser: false },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token,X-Requested-With,Accept,Content-Type,Date,Authorization"
  );

  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST")
    return res.status(405).json({ success: false, message: "Method not allowed" });

  // 1. Authenticate
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ success: false, message: "Unauthorized" });

  let userId = 1;
  try {
    const decoded = verifyAccessToken(authHeader.split(" ")[1]);
    userId = decoded.id;
  } catch {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  // 2. Parse multipart with formidable v3 (named export + async/await)
  const form = formidable({ multiples: false, keepExtensions: true });

  let files: any;
  try {
    [, files] = await form.parse(req);
  } catch (parseErr: any) {
    console.error("Formidable parse error:", parseErr);
    return res.status(500).json({
      success: false,
      message: "Error parsing form data: " + parseErr.message,
    });
  }

  // Get the file field (formidable v3 returns arrays)
  const fileField = files.file;
  if (!fileField || (Array.isArray(fileField) && fileField.length === 0)) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const file: FormidableFile = Array.isArray(fileField) ? fileField[0] : fileField;
  if (!file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  try {
    const buffer = fs.readFileSync(file.filepath);
    const originalName = file.originalFilename || "upload";
    const ext = path.extname(originalName);
    const basename = path
      .basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_");
    const mimeType = file.mimetype || "application/octet-stream";

    let finalUrl = "";
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (blobToken && blobToken.startsWith("vercel_blob_")) {
      // Upload to Vercel Blob Storage
      const pathname = `uploads/${basename}_${Date.now()}${ext}`;
      const blobRes = await fetch(
        `https://blob.vercel-storage.com/${pathname}?access=public`,
        {
          method: "PUT",
          headers: {
            authorization: `Bearer ${blobToken}`,
            "x-api-version": "7",
            "x-content-type": mimeType,
          },
          body: buffer,
        }
      );
      if (!blobRes.ok) {
        const errText = await blobRes.text();
        throw new Error(`Blob upload failed (${blobRes.status}): ${errText}`);
      }
      const blobJson = await blobRes.json();
      finalUrl = blobJson.url;
    } else {
      // Local dev fallback
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const localFile = `${basename}_${Date.now()}${ext}`;
      fs.writeFileSync(path.join(uploadDir, localFile), buffer);
      finalUrl = `/uploads/${localFile}`;
    }

    // Clean up temp file
    try { fs.unlinkSync(file.filepath); } catch (_) {}

    // Save to Postgres
    const dbResult = await queryDb(
      `INSERT INTO media_library (file_name, file_type, file_size, file_url, uploaded_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id`,
      [basename + ext, mimeType, file.size, finalUrl, userId]
    );

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        id: Number(dbResult[0]?.id),
        url: finalUrl,
        path: finalUrl,
        filename: basename + ext,
        originalName,
        size: file.size,
        mimetype: mimeType,
      },
    });
  } catch (err: any) {
    console.error("Upload Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to upload photo",
    });
  }
}
