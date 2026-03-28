import type { NextApiRequest, NextApiResponse } from "next";
import { getDefaultRatingProviderIdFromEnv } from "@/lib/ratings/readDefaultRatingProviderIdFromEnv";

/**
 * Provider mặc định từ env phía server — không cần Bearer.
 * Dùng `loadEnvConfig` để đọc đúng `.env` / `.env.local` (tránh `process.env` trống trong API route).
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const providerId = getDefaultRatingProviderIdFromEnv();

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ providerId });
}
