import type { NextApiResponse } from "next";
import type { AuthenticatedRequest } from "@/lib/auth";
import { requireAuth } from "@/lib/auth";
import { getProviderByUserId } from "@/lib/providers";

/**
 * GET /api/providers/me
 * Returns the provider profile for the current user (user_id = req.user.id).
 * 404 if current user is not linked to any provider.
 */
const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!req.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const provider = await getProviderByUserId(req.user.id);
    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found for this user" });
    }
    return res.status(200).json(provider);
  } catch (e) {
    console.error("Get provider me error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default requireAuth()(handler);
