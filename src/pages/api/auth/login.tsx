import type { NextApiRequest, NextApiResponse } from 'next';
import { findUserByEmail, verifyPassword, generateTokens, storeRefreshToken, ACCESS_TOKEN_EXPIRES_IN_SECONDS, REFRESH_TOKEN_EXPIRES_IN_SECONDS } from '@/lib/auth';

interface LoginRequest {
  email: string;
  password: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password }: LoginRequest = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const userWithPassword = await findUserByEmail(email.toLowerCase());
    
    if (!userWithPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, userWithPassword.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (userWithPassword.status === 'pending') {
      return res.status(401).json({ 
        error: 'Account not verified. Please check your email for verification link.',
        code: 'ACCOUNT_PENDING'
      });
    }

    if (userWithPassword.status === 'suspended') {
      return res.status(401).json({ 
        error: 'Account suspended. Please contact support.',
        code: 'ACCOUNT_SUSPENDED'
      });
    }

    // Remove password from user object
    const user = {
      id: userWithPassword.id,
      email: userWithPassword.email,
      role: userWithPassword.role,
      status: userWithPassword.status,
      created_at: userWithPassword.created_at,
    };

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Compute expiresAt for client-side display (security: client can read but cannot extend server validity)
    const now = Date.now();
    const accessTokenExpiresAt = new Date(now + ACCESS_TOKEN_EXPIRES_IN_SECONDS * 1000).toISOString();
    const refreshTokenExpiresAt = new Date(now + REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000).toISOString();

    // Store refresh token
    await storeRefreshToken(user.id, refreshToken);

    // Set refresh token as httpOnly cookie
    res.setHeader('Set-Cookie', [
      `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${REFRESH_TOKEN_EXPIRES_IN_SECONDS}; SameSite=Strict${
        process.env.NODE_ENV === 'production' ? '; Secure' : ''
      }`
    ]);

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      accessTokenExpiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRES_IN_SECONDS,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      user,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


