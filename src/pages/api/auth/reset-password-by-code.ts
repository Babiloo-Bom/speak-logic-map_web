import type { NextApiRequest, NextApiResponse } from "next";
import { findUserByEmail, updateUserPassword, validateVerificationToken } from "@/lib/auth";

/**
 * POST /api/auth/reset-password-by-code
 * One-step password reset for mobile: verify email + code + set new password.
 * Send code first via POST /api/auth/verify-password.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, code, password } = req.body as {
      email?: string;
      code?: string;
      password?: string;
    };

    if (!email?.trim() || !code?.trim() || !password) {
      return res.status(400).json({ error: "Email, code and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    const user = await findUserByEmail(email.toLowerCase().trim());
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }

    const userId = await validateVerificationToken(String(code).trim(), "verify_password");
    if (!userId || userId !== user.id) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }

    await updateUserPassword(userId, password);

    return res.status(200).json({
      message: "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password by code error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
