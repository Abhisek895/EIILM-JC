import type { NextApiRequest, NextApiResponse } from "next";
import { queryDb } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";
import path from "path";

// Body parser ENABLED (default) — we receive plain JSON now, no multipart
export const config = {
  api: { bodyParser: true },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token,X-Requested-With,Accept,Content-Type,Date,Authorization");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST")
    return res.status(405).json({ success: false, message: "Method not allowed" });

  // 1. Auth
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

  // 2. Parse JSON body { data: "<base64>", filename: "...", mimetype: "..." }
  const { data: base64, filename, mimetype, size } = req.body || {};

  if (!base64 || typeof base64 !== "string") {
    return res.status(400).json({ success: false, message: "No file data received" });
  }

  // Decode base64 to Buffer
  const buffer = Buffer.from(base64, "base64");
  if (!buffer.length) {
    return res.status(400).json({ success: false, message: "Empty file" });
  }

  const safeFilename = (filename as string) || "upload";
  const ext = path.extname(safeFilename);
  const basename = path
    .basename(safeFilename, ext)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_");
  const mimeType = (mimetype as string) || "application/octet-stream";

  try {
    let finalUrl = "";
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (blobToken && blobToken.startsWith("vercel_blob_")) {
      // Upload buffer directly to Vercel Blob Storage
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
      const fs = require("fs") as typeof import("fs");
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const localFile = `${basename}_${Date.now()}${ext}`;
      fs.writeFileSync(path.join(uploadDir, localFile), buffer);
      finalUrl = `/uploads/${localFile}`;
    }

    // Save to Postgres
    const dbResult = await queryDb(
      `INSERT INTO media_library (file_name, file_type, file_size, file_url, uploaded_by, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`,
      [basename + ext, mimeType, buffer.length, finalUrl, userId]
    );

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        id: Number(dbResult[0]?.id),
        url: finalUrl,
        path: finalUrl,
        filename: basename + ext,
        originalName: safeFilename,
        size: buffer.length,
        mimetype: mimeType,
      },
    });
  } catch (err: any) {
    console.error("Upload Error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to upload file" });
  }
}
