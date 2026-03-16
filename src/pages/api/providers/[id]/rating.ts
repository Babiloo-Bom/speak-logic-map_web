import type { NextApiResponse } from "next";
import type { AuthenticatedRequest } from "@/lib/auth";
import { requireAuth } from "@/lib/auth";
import {
  getProviderRatingSummary,
  upsertProviderRating,
} from "@/lib/providers";
import pool from "@/lib/database";

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const providerId = parseInt(String(id), 10);

  if (!providerId || Number.isNaN(providerId)) {
    return res.status(400).json({ error: "Invalid provider id" });
  }

  try {
    if (req.method === "GET") {
      const summary = await getProviderRatingSummary(providerId);
      return res.status(200).json(summary);
    }

    if (req.method === "POST") {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { rating, comment, project_id: rawProjectId } = req.body ?? {};

      const numericRating = Number(rating);
      if (!numericRating || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }

      const summary = await upsertProviderRating(
        providerId,
        req.user.id,
        numericRating,
        typeof comment === "string" ? comment : undefined
      );

      const projectId = typeof rawProjectId === "string" ? rawProjectId.trim().toUpperCase() || null : null;
      if (projectId) {
        await pool.query(
          `
          INSERT INTO project_identifications (user_id, project_id, used, provider_id, created_at, used_at)
          VALUES ($3, $2, true, $1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `,
          [providerId, projectId, req.user.id]
        );
      }

      return res.status(200).json(summary);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error handling provider rating:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Getting and posting ratings requires authentication
export default requireAuth([])(handler);


