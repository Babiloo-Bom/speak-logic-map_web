import type { NextApiResponse } from "next";
import type { AuthenticatedRequest } from "@/lib/auth";
import { requireAuth } from "@/lib/auth";
import { deleteProvider, getProviderById, updateProvider } from "@/lib/providers";

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;

  const providerId = parseInt(String(id), 10);
  if (!providerId || Number.isNaN(providerId)) {
    return res.status(400).json({ error: "Invalid provider id" });
  }

  try {
    if (req.method === "GET") {
      const provider = await getProviderById(providerId);
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }
      return res.status(200).json(provider);
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      const updated = await updateProvider(providerId, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Provider not found" });
      }
      return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
      await deleteProvider(providerId);
      return res.status(204).end();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Error handling provider request:", error);
    
    // Handle specific errors
    if (error?.message?.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    
    if (error?.message?.includes("cannot be empty")) {
      return res.status(400).json({ error: error.message });
    }
    
    // Handle foreign key violations
    if (error?.code === "23503") {
      return res.status(400).json({ error: "Invalid reference (user_id, geo_id, function_id, or problem_id)" });
    }
    
    return res.status(500).json({ error: "Internal server error" });
  }
};

// All provider CRUD operations are admin-only (consistent with Manager API)
export default requireAuth(["admin"])(handler);


