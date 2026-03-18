import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyRefreshToken, findUserById, generateTokens, storeRefreshToken, invalidateRefreshToken, ACCESS_TOKEN_EXPIRES_IN_SECONDS, REFRESH_TOKEN_EXPIRES_IN_SECONDS } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get refresh token from cookie or body
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not provided' });
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    
    
    if (!payload) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Find user
    const user = await findUserById(payload.userId);
    
    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Invalidate old refresh token
    await invalidateRefreshToken(refreshToken);

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Compute expiresAt for client-side display
    const now = Date.now();
    const accessTokenExpiresAt = new Date(now + ACCESS_TOKEN_EXPIRES_IN_SECONDS * 1000).toISOString();
    const refreshTokenExpiresAt = new Date(now + REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000).toISOString();

    // Store new refresh token
    await storeRefreshToken(user.id, newRefreshToken);

    // Set new refresh token as httpOnly cookie
    res.setHeader('Set-Cookie', [
      `refreshToken=${newRefreshToken}; HttpOnly; Path=/; Max-Age=${REFRESH_TOKEN_EXPIRES_IN_SECONDS}; SameSite=Strict${
        process.env.NODE_ENV === 'production' ? '; Secure' : ''
      }`
    ]);

    res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken,
      accessTokenExpiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRES_IN_SECONDS,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


