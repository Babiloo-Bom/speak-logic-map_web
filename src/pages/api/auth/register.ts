import type { NextApiRequest, NextApiResponse } from 'next';
import {createUser, generateRandomToken, createVerificationToken, createOrUpdateProfile} from '@/lib/auth';
import emailService from '@/lib/email';

interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, firstName, lastName }: RegisterRequest = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Create user
    const user = await createUser(email.toLowerCase(), password);

    // Generate verification token
    const verificationToken = generateRandomToken();
    await createVerificationToken(user.id, verificationToken, 'email_verification');

    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    await createOrUpdateProfile({
        user_id: user.id,
        first_name: firstName,
        last_name: lastName,
    })

    res.status(201).json({
      message: 'User registered successfully. Please check your email for verification.',
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);

    if (error.code === '23505') { // PostgreSQL unique violation
      return res.status(409).json({ error: 'Email already exists' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}


