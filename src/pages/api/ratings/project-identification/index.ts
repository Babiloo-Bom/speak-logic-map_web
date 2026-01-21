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
          SELECT id, user_id, project_id, used, manager_id, provider_id, created_at, used_at
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
          created_at: row.created_at,
          used_at: row.used_at || undefined,
        }));

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

    // POST - Generate new project identification
    if (req.method === "POST") {
      const projectId = generateProjectId();

      const client = await pool.connect();
      try {
        const result = await client.query(
          `
          INSERT INTO project_identifications (user_id, project_id, used, created_at)
          VALUES ($1, $2, false, CURRENT_TIMESTAMP)
          RETURNING id, user_id, project_id, used, created_at
          `,
          [userId, projectId]
        );

        const row = result.rows[0];
        const newItem: ProjectIdentification = {
          id: row.id,
          user_id: row.user_id,
          project_id: row.project_id,
          used: row.used,
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

