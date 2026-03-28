import type { NextApiResponse } from "next";
import type { AuthenticatedRequest } from "@/lib/auth";
import { requireAuth } from "@/lib/auth";
import { getDefaultRatingProviderIdFromEnv } from "@/lib/ratings/readDefaultRatingProviderIdFromEnv";

/**
 * Provider mặc định khi mở /provider-search?projectId&piId mà dòng PI chưa có sender/provider.
 * Cùng nguồn env với default-provider-public (loadEnvConfig).
 */
const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const providerId = getDefaultRatingProviderIdFromEnv();

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ providerId });
};

export default requireAuth([])(handler);
