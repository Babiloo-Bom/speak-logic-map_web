import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/lib/auth";
import { createManager } from "@/lib/managers";
import type { ManagerCreateInput } from "@/types/manager";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body as ManagerCreateInput;

    if (!body?.email || !body?.password) {
      return res
        .status(400)
        .json({ error: "email and password are required" });
    }

    const manager = await createManager(body);
    return res.status(201).json(manager);
  } catch (error: any) {
    console.error("Error creating manager:", error);
    // Surface unique violation nicely if possible
    if (error?.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Creating managers is an admin-only operation
export default requireAuth(["admin"])(handler);


