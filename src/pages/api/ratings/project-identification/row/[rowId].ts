import type { NextApiResponse } from "next";
import type { AuthenticatedRequest } from "@/lib/auth";
import { requireAuth } from "@/lib/auth";
import pool from "@/lib/database";
import type { ProjectIdentification } from "../index";

/** GET — một dòng project_identifications theo PK `id` (piId), đúng user. */
const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const raw = req.query.rowId;
  const rowId = typeof raw === "string" ? parseInt(raw, 10) : Array.isArray(raw) ? parseInt(raw[0], 10) : NaN;
  if (!Number.isFinite(rowId)) {
    return res.status(400).json({ error: "Invalid row id" });
  }

  const userId = req.user.id;

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `
        SELECT id, user_id, project_id, used, manager_id, provider_id, sender_provider_id, created_at, used_at
        FROM project_identifications
        WHERE id = $1 AND user_id = $2
        `,
        [rowId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Not found" });
      }

      const row = result.rows[0];
      const item: ProjectIdentification = {
        id: row.id,
        user_id: row.user_id,
        project_id: row.project_id,
        used: row.used,
        manager_id: row.manager_id || undefined,
        provider_id: row.provider_id || undefined,
        sender_provider_id: row.sender_provider_id || undefined,
        created_at: row.created_at,
        used_at: row.used_at || undefined,
      };

      res.setHeader("Cache-Control", "no-store, max-age=0");
      return res.status(200).json(item);
    } finally {
      client.release();
    }
  } catch (e) {
    console.error("project-identification row GET:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default requireAuth([])(handler);
