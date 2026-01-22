import type { NextApiRequest, NextApiResponse } from 'next';
import { findUserByEmail, verifyPassword, generateTokens, storeRefreshToken } from '@/lib/auth';

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

    // Store refresh token
    await storeRefreshToken(user.id, refreshToken);

    // Set refresh token as httpOnly cookie
    res.setHeader('Set-Cookie', [
      `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict${
        process.env.NODE_ENV === 'production' ? '; Secure' : ''
      }`
    ]);

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      user,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


