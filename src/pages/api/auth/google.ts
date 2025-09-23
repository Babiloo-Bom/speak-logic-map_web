import type { NextApiRequest, NextApiResponse } from 'next';
import { generateRandomToken } from '@/lib/auth';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  if (!clientId || !clientSecret) {
    console.error('Google OAuth environment variables are not configured.');
    return res.status(500).json({ error: 'Google login is not available right now.' });
  }

  const redirectUri = `${baseUrl}/api/auth/google/callback`;
  const state = generateRandomToken();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  const stateCookie = `google_oauth_state=${state}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax${
    process.env.NODE_ENV === 'production' ? '; Secure' : ''
  }`;

  res.setHeader('Set-Cookie', stateCookie);
  res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
}

