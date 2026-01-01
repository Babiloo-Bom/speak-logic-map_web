import type { NextApiResponse } from "next";
import type { AuthenticatedRequest } from "@/lib/auth";
import { requireAuth } from "@/lib/auth";
import { deleteManager, getManagerById, updateManager } from "@/lib/managers";

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;

  const managerId = parseInt(String(id), 10);
  if (!managerId || Number.isNaN(managerId)) {
    return res.status(400).json({ error: "Invalid manager id" });
  }

  try {
    if (req.method === "GET") {
      const manager = await getManagerById(managerId);
      if (!manager) {
        return res.status(404).json({ error: "Manager not found" });
      }
      return res.status(200).json(manager);
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      const updated = await updateManager(managerId, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Manager not found" });
      }
      return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
      await deleteManager(managerId);
      return res.status(204).end();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error handling manager request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// All manager CRUD operations are admin-only
export default requireAuth(["admin"])(handler);
