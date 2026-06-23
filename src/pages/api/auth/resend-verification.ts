import type { NextApiRequest, NextApiResponse } from "next";
import {
  createVerificationToken,
  findUserByEmail,
  generateRandomCode,
  generateRandomToken,
  removeUserTokensByType,
} from "@/lib/auth";
import emailService from "@/lib/email";

/**
 * POST /api/auth/resend-verification
 * Resend registration verification email (link + OTP code) for pending accounts.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body as { email?: string };

    if (!email?.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await findUserByEmail(email.toLowerCase().trim());

    // Generic response to avoid email enumeration
    const successMessage =
      "If a pending account exists for this email, a new verification email has been sent.";

    if (!user || user.status !== "pending") {
      return res.status(200).json({ message: successMessage });
    }

    await removeUserTokensByType(user.id, "email_verification");
    await removeUserTokensByType(user.id, "email_verify_code");

    const verificationToken = generateRandomToken();
    const verificationCode = generateRandomCode();
    await createVerificationToken(user.id, verificationToken, "email_verification");
    await createVerificationToken(user.id, verificationCode, "email_verify_code");

    try {
      await emailService.sendVerificationEmail(user.email, verificationToken, verificationCode);
    } catch (emailError) {
      console.error("Failed to resend verification email:", emailError);
    }

    return res.status(200).json({ message: successMessage });
  } catch (error) {
    console.error("Resend verification error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
