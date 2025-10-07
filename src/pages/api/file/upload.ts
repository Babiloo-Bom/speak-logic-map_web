import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, File as FormidableFile } from "formidable";
import fs from "fs";
import path from "path";
import { requireAuth, type AuthenticatedRequest, uploadFile, updateFileAsset } from "@/lib/auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = req.user!;

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Parse the multipart form data
    const form = new IncomingForm({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      multiples: false,
    });

    const parseForm = (): Promise<{
      fields: any;
      files: any;
    }> => {
      return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) {
            reject(err);
            return;
          }
          resolve({ fields, files });
        });
      });
    };

    const { fields, files } = await parseForm();

    // Get the uploaded file
    const uploadedFile = files.file as FormidableFile | FormidableFile[];
    if (!uploadedFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;

    // Get the desired URL from form fields
    const desiredUrl = Array.isArray(fields.url) ? fields.url[0] : fields.url;
    const existingId = Array.isArray(fields.id) ? fields.id[0] : fields.id;

    // Determine the final filename
    let finalFileName: string;
    if (desiredUrl) {
      // Extract filename from the provided URL path
      finalFileName = path.basename(desiredUrl);
    } else {
      // Use original filename or generate one
      const originalName = file.originalFilename || "upload";
      const timestamp = Date.now();
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
      finalFileName = `${timestamp}-${sanitizedName}`;
    }

    const finalPath = path.join(uploadDir, finalFileName);

    // Move the file from temp location to final location
    if (file.filepath !== finalPath) {
      // Delete existing file if it exists
      if (fs.existsSync(finalPath)) {
        fs.unlinkSync(finalPath);
      }
      fs.renameSync(file.filepath, finalPath);
    }

    // Prepare file metadata
    const url = `/uploads/${finalFileName}`;
    const mime_type = file.mimetype || "application/octet-stream";
    const size_bytes = file.size;

    // Update or create file
    let fileAsset: FileAsset;
    if (existingId) {
      const fileId = parseInt(existingId, 10);
      if (isNaN(fileId)) {
        return res.status(400).json({ error: "Invalid file ID" });
      }
      const updated = await updateFileAsset(fileId, {
        url,
        mime_type,
        size_bytes,
        uploader_id: Number(user.id),
      });

      if (!updated) {
        // Clean up uploaded file if update fails
        if (fs.existsSync(finalPath)) {
          fs.unlinkSync(finalPath);
        }
        return res.status(404).json({
          error: "File not found or not owned by user"
        });
      }
      fileAsset = updated;
      return res.status(200).json({
        id: fileAsset.id,
        url: fileAsset.url,
        message: "File updated successfully",
      });
    } else {
      fileAsset = await uploadFile({
        url,
        mime_type,
        size_bytes,
        uploader_id: Number(user.id),
      });
      return res.status(201).json({
        id: fileAsset.id,
        url: fileAsset.url,
        message: "File uploaded successfully",
      });
    }
  } catch (err: any) {
    console.error("Upload error:", err);

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: "File size exceeds the maximum limit of 10MB",
      });
    }

    return res.status(500).json({
      error: err.message || "Internal server error",
    });
  }
}

export default requireAuth()(handler);