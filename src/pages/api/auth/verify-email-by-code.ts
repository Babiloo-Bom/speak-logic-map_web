import type { NextApiRequest, NextApiResponse } from "next";
import { findUserByEmail, updateUserStatus, validateVerificationToken } from "@/lib/auth";

/**
 * POST /api/auth/verify-email-by-code
 * Activate account using the 6-digit code sent after registration (mobile).
 * Link-based verification still uses POST /api/auth/verify.
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

    if (user.status === "active") {
      return res.status(200).json({
        message: "Email already verified. Your account is active.",
      });
    }

    if (user.status !== "pending") {
      return res.status(400).json({ error: "Account cannot be verified" });
    }

    const userId = await validateVerificationToken(String(code).trim(), "email_verification_code");
    if (!userId || userId !== user.id) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }

    await updateUserStatus(userId, "active");

    return res.status(200).json({
      message: "Email verified successfully. Your account is now active.",
    });
  } catch (error) {
    console.error("Verify email by code error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
