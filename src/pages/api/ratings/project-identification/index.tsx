import type { NextApiResponse } from "next";
import type { AuthenticatedRequest } from "@/lib/auth";
import { requireAuth } from "@/lib/auth";
import pool from "@/lib/database";
import { v4 as uuidv4 } from "uuid";

// ============================================
// Types
// ============================================

export interface ProjectIdentification {
  id: number;
  user_id: number;
  project_id: string;        // UUID like "277CA003-06I0-478F-9385-4D2732771EBE"
  used: boolean;             // Has this ID been used for a rating?
  manager_id?: number;       // If used, which manager was rated
  provider_id?: number;      // If used, which provider was rated
  sender_provider_id?: number; // If sent to user by a provider
  created_at: string;        // Date created
  used_at?: string;          // Date when used
}

export interface ProjectIdentificationListResponse {
  items: ProjectIdentification[];
  total: number;
}

// ============================================
// Helper: Generate Project ID (formatted UUID)
// ============================================

function generateProjectId(): string {
  // Generate UUID and format it to uppercase
  return uuidv4().toUpperCase();
}

// ============================================
// API Handler
// ============================================

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.user.id;

  try {
    // GET - List all project identifications for the user
    if (req.method === "GET") {
      const { page = "1", limit = "20", used } = req.query;
      const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
      const offset = (pageNum - 1) * limitNum;

      let whereClause = "WHERE user_id = $1";
      const params: (number | boolean)[] = [userId];

      // Filter by used status if provided
      if (used === "true") {
        whereClause += " AND used = true";
      } else if (used === "false") {
        whereClause += " AND used = false";
      }

      const client = await pool.connect();
      try {
        // Get total count
        const countResult = await client.query(
          `SELECT COUNT(*)::int as total FROM project_identifications ${whereClause}`,
          params
        );
        const total = countResult.rows[0]?.total || 0;

        // Get items
        const result = await client.query(
          `
          SELECT id, user_id, project_id, used, manager_id, provider_id, sender_provider_id, created_at, used_at
          FROM project_identifications
          ${whereClause}
          ORDER BY created_at DESC
          LIMIT $${params.length + 1} OFFSET $${params.length + 2}
          `,
          [...params, limitNum, offset]
        );

        const items: ProjectIdentification[] = result.rows.map((row) => ({
          id: row.id,
          user_id: row.user_id,
          project_id: row.project_id,
          used: row.used,
          manager_id: row.manager_id || undefined,
          provider_id: row.provider_id || undefined,
          sender_provider_id: row.sender_provider_id || undefined,
          created_at: row.created_at,
          used_at: row.used_at || undefined,
        }));

        res.setHeader("Cache-Control", "no-store, max-age=0");
        return res.status(200).json({
          items,
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        });
      } finally {
        client.release();
      }
    }

    // POST - Save (with optional project_id) or get/generate project identification
    if (req.method === "POST") {
      const body = typeof req.body === "object" ? req.body : {};
      const requestedProjectId =
        typeof body.project_id === "string" ? body.project_id.trim().toUpperCase() : null;

      const client = await pool.connect();
      try {
        // If client sends project_id (e.g. from Save or pasted from another user), always create a new row
        if (requestedProjectId) {
          const upsertResult = await client.query(
            `
            INSERT INTO project_identifications (user_id, project_id, used, created_at)
            VALUES ($1, $2, false, CURRENT_TIMESTAMP)
            RETURNING id, user_id, project_id, used, manager_id, provider_id, created_at, used_at
            `,
            [userId, requestedProjectId]
          );
          const row = upsertResult.rows[0];
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
          return res.status(201).json(item);
        }

        // No project_id in body: Generate behavior
        // Priority:
        // 1) If a provider has sent a project_id to this user (unused), return the newest one.
        // 2) Otherwise, return user's newest unused project_id (if any).
        // 3) Otherwise, generate a new one.
        const sentResult = await client.query(
          `
          SELECT id, user_id, project_id, used, manager_id, provider_id, sender_provider_id, created_at, used_at
          FROM project_identifications
          WHERE user_id = $1 AND used = false AND sender_provider_id IS NOT NULL
          ORDER BY created_at DESC
          LIMIT 1
          `,
          [userId]
        );

        if (sentResult.rows.length > 0) {
          const row = sentResult.rows[0];
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
          return res.status(200).json(item);
        }

        const existingUnusedResult = await client.query(
          `
          SELECT id, user_id, project_id, used, manager_id, provider_id, sender_provider_id, created_at, used_at
          FROM project_identifications
          WHERE user_id = $1 AND used = false
          ORDER BY created_at DESC
          LIMIT 1
          `,
          [userId]
        );

        if (existingUnusedResult.rows.length > 0) {
          const row = existingUnusedResult.rows[0];
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
          return res.status(200).json(item);
        }

        const projectId = generateProjectId();
        const insertResult = await client.query(
          `
          INSERT INTO project_identifications (user_id, project_id, used, created_at)
          VALUES ($1, $2, false, CURRENT_TIMESTAMP)
          RETURNING id, user_id, project_id, used, sender_provider_id, created_at
          `,
          [userId, projectId]
        );

        const row = insertResult.rows[0];
        const newItem: ProjectIdentification = {
          id: row.id,
          user_id: row.user_id,
          project_id: row.project_id,
          used: row.used,
          sender_provider_id: row.sender_provider_id || undefined,
          created_at: row.created_at,
        };

        return res.status(201).json(newItem);
      } finally {
        client.release();
      }
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error handling project identification:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default requireAuth([])(handler);

