import type { NextApiResponse } from "next";
import type { AuthenticatedRequest } from "@/lib/auth";
import { requireAuth } from "@/lib/auth";
import { getManagerByUserId } from "@/lib/managers";

/**
 * GET /api/managers/me
 * Returns the manager profile for the current user (user_id = req.user.id).
 * 404 if current user is not linked to any manager.
 */
const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!req.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const manager = await getManagerByUserId(req.user.id);
    if (!manager) {
      return res.status(404).json({ error: "Manager profile not found for this user" });
    }
    return res.status(200).json(manager);
  } catch (e) {
    console.error("Get manager me error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default requireAuth()(handler);
