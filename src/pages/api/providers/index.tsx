import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/lib/auth";
import { createProvider } from "@/lib/providers";
import type { ProviderCreateInput } from "@/types/provider";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body as ProviderCreateInput;

    // Validate required fields
    if (!body?.name || body.name.trim().length === 0) {
      return res.status(400).json({ error: "Provider name is required" });
    }

    const provider = await createProvider(body);
    return res.status(201).json(provider);
  } catch (error: any) {
    console.error("Error creating provider:", error);
    
    // Handle specific errors
    if (error?.message?.includes("required")) {
      return res.status(400).json({ error: error.message });
    }
    
    // Handle foreign key violations
    if (error?.code === "23503") {
      return res.status(400).json({ error: "Invalid reference (user_id, geo_id, function_id, or problem_id)" });
    }
    
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Any authenticated user can create a provider (e.g. from Add Providers form)
export default requireAuth()(handler);

