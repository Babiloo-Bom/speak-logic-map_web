import type { NextApiResponse } from "next";
import { requireAuth, type AuthenticatedRequest, findUserByEmail } from "@/lib/auth";
import { getProviderByUserId } from "@/lib/providers";
import pool from "@/lib/database";

function isLikelyUuid36(value: string): boolean {
  const v = value.trim().toUpperCase();
  return /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/.test(v);
}

type Body = {
  recipient_email?: string;
  project_id?: string;
};

/**
 * Provider sends a Project Identification to a user.
 * The receiver will get this GUID when clicking "Generate Project Identification".
 */
const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const body = (req.body ?? {}) as Body;
    const recipientEmail = typeof body.recipient_email === "string" ? body.recipient_email.trim() : "";
    const projectIdRaw = typeof body.project_id === "string" ? body.project_id.trim().toUpperCase() : "";

    if (!recipientEmail) return res.status(400).json({ error: "recipient_email is required" });
    if (!projectIdRaw) return res.status(400).json({ error: "project_id is required" });
    if (!isLikelyUuid36(projectIdRaw)) return res.status(400).json({ error: "project_id must be a UUID" });

    const senderProvider = await getProviderByUserId(req.user.id);
    if (!senderProvider) return res.status(403).json({ error: "Only provider accounts can send project identification" });

    const recipient = await findUserByEmail(recipientEmail.toLowerCase());
    if (!recipient) return res.status(404).json({ error: "Recipient user not found" });

    const client = await pool.connect();
    try {
      const result = await client.query(
        `
        INSERT INTO project_identifications (user_id, project_id, used, sender_provider_id, created_at)
        VALUES ($1, $2, false, $3, CURRENT_TIMESTAMP)
        RETURNING id, user_id, project_id, used, sender_provider_id, created_at
        `,
        [recipient.id, projectIdRaw, senderProvider.id]
      );

      return res.status(201).json({
        message: "Sent project identification",
        item: result.rows[0],
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Send project identification error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default requireAuth([])(handler);

