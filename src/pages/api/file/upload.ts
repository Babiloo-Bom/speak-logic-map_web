// pages/api/files/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";

interface UploadFileRequest {
  url?: string;
  mime_type?: string;
  size_bytes?: number;
  uploader_id?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { url, mime_type, size_bytes, uploader_id }: UploadFileRequest = req.body;

    if (!url || !uploader_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      INSERT INTO file_assets (url, mime_type, size_bytes, uploader_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;
    const values = [url, mime_type || null, size_bytes || null, uploader_id];

    const result = await pool.query(query, values);

    return res.status(200).json({ id: result.rows[0].id });
  } catch (err: any) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
