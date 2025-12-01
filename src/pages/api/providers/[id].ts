import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth, AuthenticatedRequest } from "@/lib/auth";
import {
  getProviderById,
} from "@/lib/providers";

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;

  const providerId = parseInt(String(id), 10);
  if (!providerId || Number.isNaN(providerId)) {
    return res.status(400).json({ error: "Invalid provider id" });
  }

  try {
    switch (req.method) {
      case "GET": {
        const provider = await getProviderById(providerId);
        if (!provider) {
          return res.status(404).json({ error: "Provider not found" });
        }
        return res.status(200).json(provider);
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error handling provider request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Viewing provider detail requires authentication; mutations will use separate routes if needed
export default requireAuth([])(handler);


