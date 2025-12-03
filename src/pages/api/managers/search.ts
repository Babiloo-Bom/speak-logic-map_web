import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/lib/auth";
import { searchManagers } from "@/lib/managers";
import type { ManagerSearchParams } from "@/types/manager";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { q, status, page, limit } = req.query;

    const params: ManagerSearchParams = {
      q: typeof q === "string" ? q : undefined,
      status: typeof status === "string" ? status : undefined,
      page: typeof page === "string" ? parseInt(page, 10) || 1 : 1,
      limit: typeof limit === "string" ? parseInt(limit, 10) || 20 : 20,
    };

    const result = await searchManagers(params);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error searching managers:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Only admins can search managers in admin module
export default requireAuth(["admin"])(handler);


