import type { NextApiRequest, NextApiResponse } from "next";
import {
  ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  REFRESH_TOKEN_EXPIRES_IN_SECONDS,
  findOrCreateUserFromSocialLogin,
  generateTokens,
  storeRefreshToken,
} from "@/lib/auth";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";

type SocialAuthRequest = {
  /** Firebase ID token từ Google/Apple/Facebook sign-in (mobile) */
  idToken: string;
  /** Optional hint for logging/analytics */
  provider?: "google" | "apple" | "facebook" | string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { idToken }: SocialAuthRequest = req.body ?? {};
    if (!idToken || typeof idToken !== "string") {
      return res.status(400).json({ error: "idToken is required" });
    }

    const decoded = await verifyFirebaseIdToken(idToken);
    const email = typeof decoded.email === "string" ? decoded.email.toLowerCase() : undefined;
    if (!email) {
      return res.status(400).json({ error: "Firebase token missing email" });
    }

    const name = typeof decoded.name === "string" ? decoded.name.trim() : "";
    const parts = name ? name.split(/\s+/).filter(Boolean) : [];
    const firstName = parts.length > 0 ? parts[0] : undefined;
    const lastName = parts.length > 1 ? parts.slice(1).join(" ") : undefined;

    const { user, profile } = await findOrCreateUserFromSocialLogin(email, firstName, lastName);

    const { accessToken, refreshToken } = generateTokens(user);
    await storeRefreshToken(user.id, refreshToken);

    const now = Date.now();
    const accessTokenExpiresAt = new Date(now + ACCESS_TOKEN_EXPIRES_IN_SECONDS * 1000).toISOString();
    const refreshTokenExpiresAt = new Date(now + REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000).toISOString();

    res.setHeader("Set-Cookie", [
      `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${REFRESH_TOKEN_EXPIRES_IN_SECONDS}; SameSite=Strict${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`,
    ]);

    return res.status(200).json({
      message: "Social login successful",
      accessToken,
      refreshToken,
      // snake_case aliases for mobile clients
      access_token: accessToken,
      refresh_token: refreshToken,
      accessTokenExpiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRES_IN_SECONDS,
      access_token_expires_in: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      refresh_token_expires_in: REFRESH_TOKEN_EXPIRES_IN_SECONDS,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      access_token_expires_at: accessTokenExpiresAt,
      refresh_token_expires_at: refreshTokenExpiresAt,
      user,
      profile,
      firebase: {
        uid: decoded.uid,
        email: decoded.email ?? null,
      },
    });
  } catch (error) {
    console.error("Social auth error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

