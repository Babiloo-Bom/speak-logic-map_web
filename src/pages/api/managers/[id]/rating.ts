import type { NextApiResponse } from "next";
import type { AuthenticatedRequest } from "@/lib/auth";
import { requireAuth } from "@/lib/auth";
import { rateManager, getManagerById } from "@/lib/managers";
import pool from "@/lib/database";

// ============================================
// Types
// ============================================

export interface ManagerRating {
  id: number;
  manager_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface ManagerRatingSummary {
  averageRating: number;
  ratingCount: number;
  ratings: ManagerRating[];
}

// ============================================
// Get Manager Rating Summary
// ============================================

async function getManagerRatingSummary(
  managerId: number
): Promise<ManagerRatingSummary> {
  const client = await pool.connect();

  try {
    // Get average and count
    const summaryResult = await client.query(
      `
        SELECT
          AVG(rating)::numeric(3,2) AS average_rating,
          COUNT(*)::int AS rating_count
        FROM manager_ratings
        WHERE manager_id = $1
      `,
      [managerId]
    );

    const { average_rating, rating_count } = summaryResult.rows[0] ?? {
      average_rating: 0,
      rating_count: 0,
    };
    const avg = Number(average_rating ?? 0);

    // Get all ratings with user info
    const ratingsResult = await client.query(
      `
        SELECT 
          mr.id, 
          mr.manager_id, 
          mr.user_id, 
          mr.rating, 
          mr.comment, 
          mr.created_at,
          u.email,
          COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '') as user_name
        FROM manager_ratings mr
        LEFT JOIN users u ON u.id = mr.user_id
        LEFT JOIN profiles p ON p.user_id = mr.user_id
        WHERE mr.manager_id = $1
        ORDER BY mr.created_at DESC
      `,
      [managerId]
    );

    return {
      averageRating: avg,
      ratingCount: Number(rating_count ?? 0),
      ratings: ratingsResult.rows.map((row) => ({
        id: row.id,
        manager_id: row.manager_id,
        user_id: row.user_id,
        rating: Number(row.rating),
        comment: row.comment ?? undefined,
        created_at: row.created_at,
        user_email: row.email,
        user_name: row.user_name?.trim() || undefined,
      })),
    };
  } finally {
    client.release();
  }
}

// ============================================
// Upsert Manager Rating (with summary update)
// ============================================

async function upsertManagerRating(
  managerId: number,
  userId: number,
  rating: number,
  comment?: string
): Promise<ManagerRatingSummary> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Insert or update rating
    await client.query(
      `
        INSERT INTO manager_ratings (manager_id, user_id, rating, comment)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (manager_id, user_id)
        DO UPDATE SET
          rating = EXCLUDED.rating,
          comment = EXCLUDED.comment,
          created_at = CURRENT_TIMESTAMP
      `,
      [managerId, userId, rating, comment ?? null]
    );

    // Recalculate average rating and update managers table
    const summaryResult = await client.query(
      `
        SELECT
          AVG(rating)::numeric(3,2) AS average_rating,
          COUNT(*)::int AS rating_count
        FROM manager_ratings
        WHERE manager_id = $1
      `,
      [managerId]
    );

    const { average_rating, rating_count } = summaryResult.rows[0];
    const avg = Number(average_rating ?? 0);

    // Update manager's rating and rating_count
    await client.query(
      `
        UPDATE managers
        SET rating = $2,
            rating_count = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
      [managerId, avg, rating_count]
    );

    // Get all ratings
    const ratingsResult = await client.query(
      `
        SELECT 
          mr.id, 
          mr.manager_id, 
          mr.user_id, 
          mr.rating, 
          mr.comment, 
          mr.created_at,
          u.email,
          COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '') as user_name
        FROM manager_ratings mr
        LEFT JOIN users u ON u.id = mr.user_id
        LEFT JOIN profiles p ON p.user_id = mr.user_id
        WHERE mr.manager_id = $1
        ORDER BY mr.created_at DESC
      `,
      [managerId]
    );

    await client.query("COMMIT");

    return {
      averageRating: avg,
      ratingCount: Number(rating_count ?? 0),
      ratings: ratingsResult.rows.map((row) => ({
        id: row.id,
        manager_id: row.manager_id,
        user_id: row.user_id,
        rating: Number(row.rating),
        comment: row.comment ?? undefined,
        created_at: row.created_at,
        user_email: row.email,
        user_name: row.user_name?.trim() || undefined,
      })),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// ============================================
// API Handler
// ============================================

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const managerId = parseInt(String(id), 10);

  if (!managerId || Number.isNaN(managerId)) {
    return res.status(400).json({ error: "Invalid manager id" });
  }

  try {
    // Check if manager exists
    const manager = await getManagerById(managerId);
    if (!manager) {
      return res.status(404).json({ error: "Manager not found" });
    }

    // GET - Get rating summary
    if (req.method === "GET") {
      const summary = await getManagerRatingSummary(managerId);
      return res.status(200).json(summary);
    }

    // POST - Add/Update rating
    if (req.method === "POST") {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { rating, comment } = req.body ?? {};

      const numericRating = Number(rating);
      if (!numericRating || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }

      const summary = await upsertManagerRating(
        managerId,
        req.user.id,
        numericRating,
        typeof comment === "string" ? comment : undefined
      );

      return res.status(200).json(summary);
    }

    // DELETE - Remove user's rating
    if (req.method === "DELETE") {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        // Delete the rating
        await client.query(
          `DELETE FROM manager_ratings WHERE manager_id = $1 AND user_id = $2`,
          [managerId, req.user.id]
        );

        // Recalculate average
        const summaryResult = await client.query(
          `
            SELECT
              COALESCE(AVG(rating)::numeric(3,2), 0) AS average_rating,
              COUNT(*)::int AS rating_count
            FROM manager_ratings
            WHERE manager_id = $1
          `,
          [managerId]
        );

        const { average_rating, rating_count } = summaryResult.rows[0];

        // Update manager
        await client.query(
          `
            UPDATE managers
            SET rating = $2,
                rating_count = $3,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
          `,
          [managerId, average_rating, rating_count]
        );

        await client.query("COMMIT");

        return res.status(200).json({ 
          message: "Rating deleted successfully",
          averageRating: Number(average_rating),
          ratingCount: Number(rating_count)
        });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error handling manager rating:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Getting and posting ratings requires authentication
export default requireAuth([])(handler);

