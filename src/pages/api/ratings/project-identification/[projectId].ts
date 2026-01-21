import type { NextApiResponse } from "next";
import type { AuthenticatedRequest } from "@/lib/auth";
import { requireAuth } from "@/lib/auth";
import pool from "@/lib/database";
import type { ProjectIdentification } from "./index";

// ============================================
// API Handler - Single Project Identification
// ============================================

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { projectId } = req.query;
  const userId = req.user.id;

  if (!projectId || typeof projectId !== "string") {
    return res.status(400).json({ error: "Invalid project ID" });
  }

  try {
    const client = await pool.connect();

    try {
      // GET - Get single project identification by project_id (UUID)
      if (req.method === "GET") {
        const result = await client.query(
          `
          SELECT id, user_id, project_id, used, manager_id, provider_id, created_at, used_at
          FROM project_identifications
          WHERE project_id = $1 AND user_id = $2
          `,
          [projectId, userId]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: "Project identification not found" });
        }

        const row = result.rows[0];
        const item: ProjectIdentification = {
          id: row.id,
          user_id: row.user_id,
          project_id: row.project_id,
          used: row.used,
          manager_id: row.manager_id || undefined,
          provider_id: row.provider_id || undefined,
          created_at: row.created_at,
          used_at: row.used_at || undefined,
        };

        return res.status(200).json(item);
      }

      // DELETE - Delete a project identification (only if not used)
      if (req.method === "DELETE") {
        // Check if exists and belongs to user
        const checkResult = await client.query(
          `SELECT id, used FROM project_identifications WHERE project_id = $1 AND user_id = $2`,
          [projectId, userId]
        );

        if (checkResult.rows.length === 0) {
          return res.status(404).json({ error: "Project identification not found" });
        }

        if (checkResult.rows[0].used) {
          return res.status(400).json({ error: "Cannot delete a used project identification" });
        }

        await client.query(
          `DELETE FROM project_identifications WHERE project_id = $1 AND user_id = $2`,
          [projectId, userId]
        );

        return res.status(200).json({ message: "Project identification deleted successfully" });
      }

      return res.status(405).json({ error: "Method not allowed" });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error handling project identification:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default requireAuth([])(handler);

