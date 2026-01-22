import type { NextApiRequest, NextApiResponse } from 'next';
import { findUserByEmail, generateRandomToken, createVerificationToken } from '@/lib/auth';
import emailService from '@/lib/email';
import { validateVerificationToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, code } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Find user
    const user = await findUserByEmail(email.toLowerCase());

    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }
    const userId = await validateVerificationToken(code, 'verify_password');

    if (!userId) {
      return res.status(400).json({ error: 'Invalid code' });
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    await createVerificationToken(user.id, resetToken, 'password_reset');

    // Send reset email
    try {
      await emailService.sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Still return success to prevent revealing if email exists
    }

    res.status(200).json({
      message: 'Verified successfully',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


