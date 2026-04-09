import type { NextApiRequest, NextApiResponse } from "next";
import {
  ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  REFRESH_TOKEN_EXPIRES_IN_SECONDS,
  findUserById,
  generateTokens,
  invalidateRefreshToken,
  storeRefreshToken,
  validateRefreshToken,
  verifyRefreshToken,
} from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get refresh token from cookie or body (support both camelCase and snake_case)
    const refreshToken = req.cookies.refreshToken || req.body?.refreshToken || req.body?.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token not provided" });
    }

    // Verify refresh token signature/expiry
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // Ensure token exists in DB and not expired (prevents replay after logout/rotation)
    const dbUserId = await validateRefreshToken(refreshToken);
    if (!dbUserId || dbUserId !== payload.userId) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const user = await findUserById(payload.userId);
    if (!user || user.status !== "active") {
      return res.status(401).json({ error: "User not found or inactive" });
    }

    // Rotate refresh token
    await invalidateRefreshToken(refreshToken);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    await storeRefreshToken(user.id, newRefreshToken);

    const now = Date.now();
    const accessTokenExpiresAt = new Date(now + ACCESS_TOKEN_EXPIRES_IN_SECONDS * 1000).toISOString();
    const refreshTokenExpiresAt = new Date(now + REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000).toISOString();

    res.setHeader("Set-Cookie", [
      `refreshToken=${newRefreshToken}; HttpOnly; Path=/; Max-Age=${REFRESH_TOKEN_EXPIRES_IN_SECONDS}; SameSite=Strict${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`,
    ]);

    return res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken,
      access_token: accessToken,
      refresh_token: newRefreshToken,
      accessTokenExpiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRES_IN_SECONDS,
      access_token_expires_in: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      refresh_token_expires_in: REFRESH_TOKEN_EXPIRES_IN_SECONDS,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      access_token_expires_at: accessTokenExpiresAt,
      refresh_token_expires_at: refreshTokenExpiresAt,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Refresh-token error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

