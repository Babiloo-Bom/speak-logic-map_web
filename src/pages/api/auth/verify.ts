import type { NextApiRequest, NextApiResponse } from 'next';
import { validateVerificationToken, updateUserStatus } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Validate token
    const userId = await validateVerificationToken(token, 'email_verification');

    if (!userId) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    // Update user status to active
    await updateUserStatus(userId, 'active');

    res.status(200).json({
      message: 'Email verified successfully. Your account is now active.',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


