import type { NextApiResponse } from "next";
import type { AuthenticatedRequest } from "@/lib/auth";
import { requireAuth } from "@/lib/auth";
import pool from "@/lib/database";

/**
 * GET - Average functions (provider) rating across all provider_ratings.
 * Returns { average: number (1-5), count: number }.
 */
const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT COALESCE(AVG(rating)::numeric(5,2), 0) AS average, COUNT(*)::int AS count FROM provider_ratings`
      );
      const row = result.rows[0];
      const average = Math.min(5, Math.max(0, Number(row?.average ?? 0)));
      const count = Number(row?.count ?? 0) || 0;
      return res.status(200).json({ average: Math.round(average * 10) / 10, count });
    } finally {
      client.release();
    }
  } catch (e) {
    console.error("Average rating error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default requireAuth([])(handler);
