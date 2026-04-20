import type { NextApiResponse } from "next";
import pool from "@/lib/database";
import { AuthenticatedRequest, requireAuth } from "@/lib/auth";

/**
 * GET /api/admin/users/:id
 * Admin-only: fetch a user's account info (role/status) to drive admin UI.
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rawId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const userId = parseInt(String(rawId || "").trim(), 10);
  if (Number.isNaN(userId) || userId < 1) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  const client = await pool.connect();
  try {
    const r = await client.query<{
      id: string;
      email: string;
      role: string;
      status: string;
      full_name: string | null;
    }>(
      `SELECT u.id, u.email, u.role, u.status,
              NULLIF(TRIM(CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, ''))), '') AS full_name
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = $1
       LIMIT 1`,
      [userId]
    );

    const row = r.rows[0];
    if (!row) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      user: {
        id: Number(row.id),
        email: row.email,
        role: row.role,
        status: row.status,
        fullName: row.full_name,
      },
    });
  } catch (e) {
    console.error("admin users/[id] error:", e);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
}

export default requireAuth(["admin"])(handler);

