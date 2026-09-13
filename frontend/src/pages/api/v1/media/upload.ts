import type { NextApiRequest, NextApiResponse } from "next";
import Busboy from "busboy";
import { queryDb } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";
import path from "path";

export const config = {
  api: { bodyParser: false },
};

function readRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function parseMultipart(
  rawBody: Buffer,
  contentType: string
): Promise<{ buffer: Buffer; filename: string; mimetype: string } | null> {
  return new Promise((resolve, reject) => {
    let busboy: any;
    try {
      busboy = Busboy({ headers: { "content-type": contentType } });
    } catch (e) {
      return reject(new Error("Invalid content-type: " + contentType));
    }

    let resolved = false;

    busboy.on("file", (_field: string, stream: any, info: any) => {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk: Buffer) => chunks.push(chunk));
      stream.on("end", () => {
        if (!resolved) {
          resolved = true;
          resolve({
            buffer: Buffer.concat(chunks),
            filename: info.filename || "upload",
            mimetype: info.mimeType || "application/octet-stream",
          });
        }
      });
      stream.on("error", reject);
    });

    busboy.on("finish", () => {
      if (!resolved) { resolved = true; resolve(null); }
    });

    busboy.on("error", reject);
    busboy.write(rawBody);
    busboy.end();
  });
}

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

  const contentType = req.headers["content-type"] || "";

  // Read raw body
  let rawBody: Buffer;
  try {
    rawBody = await readRawBody(req);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to read body: " + err.message });
  }

  // DEBUG: return info about what we received so we can diagnose
  console.log("[upload] body bytes:", rawBody.length, "| content-type:", contentType);

  if (!rawBody.length) {
    return res.status(400).json({
      success: false,
      message: "Empty request body",
      debug: { contentType, bodyLength: 0 }
    });
  }

  if (!contentType.includes("multipart/form-data")) {
    return res.status(400).json({
      success: false,
      message: "Expected multipart/form-data",
      debug: { contentType, bodyLength: rawBody.length }
    });
  }

  let fileData: { buffer: Buffer; filename: string; mimetype: string } | null;
  try {
    fileData = await parseMultipart(rawBody, contentType);
  } catch (err: any) {
    console.error("Busboy parse error:", err);
    return res.status(500).json({
      success: false,
      message: "Error parsing upload: " + err.message,
      debug: { contentType, bodyLength: rawBody.length, bodyPreview: rawBody.slice(0, 200).toString("latin1") }
    });
  }

  if (!fileData || !fileData.buffer.length)
    return res.status(400).json({ success: false, message: "No file field in form data", debug: { contentType } });

  const { buffer, filename, mimetype } = fileData;
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext).toLowerCase().replace(/[^a-z0-9_-]/g, "_");

  try {
    let finalUrl = "";
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (blobToken && blobToken.startsWith("vercel_blob_")) {
      const pathname = `uploads/${basename}_${Date.now()}${ext}`;
      const blobRes = await fetch(
        `https://blob.vercel-storage.com/${pathname}?access=public`,
        {
          method: "PUT",
          headers: {
            authorization: `Bearer ${blobToken}`,
            "x-api-version": "7",
            "x-content-type": mimetype,
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
      const fs = require("fs") as typeof import("fs");
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const localFile = `${basename}_${Date.now()}${ext}`;
      fs.writeFileSync(path.join(uploadDir, localFile), buffer);
      finalUrl = `/uploads/${localFile}`;
    }

    const dbResult = await queryDb(
      `INSERT INTO media_library (file_name, file_type, file_size, file_url, uploaded_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id`,
      [basename + ext, mimetype, buffer.length, finalUrl, userId]
    );

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        id: Number(dbResult[0]?.id),
        url: finalUrl,
        path: finalUrl,
        filename: basename + ext,
        originalName: filename,
        size: buffer.length,
        mimetype,
      },
    });
  } catch (err: any) {
    console.error("Upload Error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to upload photo" });
  }
}
