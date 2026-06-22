import type { NextApiRequest, NextApiResponse } from "next";
import {
  createVerificationToken,
  findUserByEmail,
  generateRandomToken,
  validateVerificationToken,
} from "@/lib/auth";

/**
 * POST /api/auth/forgot-password/verify-code
 * Verify the 6-digit code sent to email, then return a reset token.
 * Mobile/web can use the token with POST /api/auth/reset-password.
 * Does NOT send a reset link email.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, code } = req.body as { email?: string; code?: string };

    if (!email?.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!code?.trim()) {
      return res.status(400).json({ error: "Code is required" });
    }

    const user = await findUserByEmail(email.toLowerCase().trim());
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }

    const userId = await validateVerificationToken(String(code).trim(), "verify_password");
    if (!userId || userId !== user.id) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }

    const resetToken = generateRandomToken();
    await createVerificationToken(user.id, resetToken, "password_reset");

    return res.status(200).json({
      message: "Code verified successfully",
      resetToken,
      reset_token: resetToken,
    });
  } catch (error) {
    console.error("Verify reset code error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
