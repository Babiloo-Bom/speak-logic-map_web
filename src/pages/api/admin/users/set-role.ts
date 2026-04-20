import type { NextApiResponse } from "next";
import { AuthenticatedRequest, requireAuth, updateUserRole } from "@/lib/auth";

const VALID_ROLES = ["user", "manager", "provider", "admin", "moderator", "premium"] as const;
type ValidRole = (typeof VALID_ROLES)[number];

type Body = {
  userId: number;
  role: ValidRole | string;
};

/**
 * PUT /api/admin/users/set-role
 * Admin-only: set role (account type) for an arbitrary user.
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = (req.body || {}) as Partial<Body>;
  const userId = parseInt(String(body.userId ?? "").trim(), 10);
  const role = String(body.role ?? "").trim();

  if (Number.isNaN(userId) || userId < 1) {
    return res.status(400).json({ error: "userId must be a positive integer" });
  }
  if (!role || !(VALID_ROLES as readonly string[]).includes(role)) {
    return res.status(400).json({
      error: `Invalid role. Valid roles are: ${VALID_ROLES.join(", ")}`,
    });
  }

  await updateUserRole(userId, role);
  return res.status(200).json({
    message: "Role updated successfully",
    userId,
    newRole: role,
  });
}

export default requireAuth(["admin"])(handler);

