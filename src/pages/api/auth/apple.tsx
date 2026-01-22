import type { NextApiRequest, NextApiResponse } from 'next';
import { generateRandomToken } from '@/lib/auth';

const APPLE_AUTH_URL = 'https://appleid.apple.com/auth/authorize';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.APPLE_CLIENT_ID;
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  if (!clientId) {
    console.error('Apple OAuth environment variables are not configured.');
    return res.status(500).json({ error: 'Apple login is not available right now.' });
  }

  const redirectUri = `${baseUrl}/api/auth/apple/callback`;
  const state = generateRandomToken();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'name email',
    response_mode: 'form_post',
    state,
  });

  const stateCookie = `apple_oauth_state=${state}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax${
    process.env.NODE_ENV === 'production' ? '; Secure' : ''
  }`;

  res.setHeader('Set-Cookie', stateCookie);
  res.redirect(`${APPLE_AUTH_URL}?${params.toString()}`);
}