import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/lib/auth";
import { searchProviders } from "@/lib/providers";
import type { ProviderSearchParams } from "@/types/provider";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      q,
      sortBy,
      page,
      limit,
      functionId,
      problemId,
      minRating,
      applicable,
    } = req.query;

    const params: ProviderSearchParams = {
      q: typeof q === "string" ? q : undefined,
      sortBy:
        typeof sortBy === "string"
          ? (sortBy.toLowerCase() as ProviderSearchParams["sortBy"])
          : "all",
      page: typeof page === "string" ? parseInt(page, 10) || 1 : 1,
      limit: typeof limit === "string" ? parseInt(limit, 10) || 20 : 20,
      functionId:
        typeof functionId === "string" ? parseInt(functionId, 10) : undefined,
      problemId:
        typeof problemId === "string" ? parseInt(problemId, 10) : undefined,
      minRating:
        typeof minRating === "string" ? parseFloat(minRating) : undefined,
      applicable:
        typeof applicable === "string"
          ? applicable === "true"
          : undefined,
    };

    const result = await searchProviders(params);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error searching providers:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Search should be available to any authenticated user
export default requireAuth([])(handler);


