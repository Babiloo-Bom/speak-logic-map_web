import type { NextApiRequest, NextApiResponse } from 'next';
import { generateRandomToken } from '@/lib/auth';

const FACEBOOK_AUTH_URL = 'https://www.facebook.com/v16.0/dialog/oauth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  if (!clientId) {
    console.error('Facebook OAuth environment variables are not configured.');
    return res.status(500).json({ error: 'Facebook login is not available right now.' });
  }

  const redirectUri = `${baseUrl}/api/auth/facebook/callback`;
  const state = generateRandomToken();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    response_type: 'code',
    scope: 'email public_profile',
    auth_type: 'rerequest',
  });

  const stateCookie = `facebook_oauth_state=${state}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax${
    process.env.NODE_ENV === 'production' ? '; Secure' : ''
  }`;

  res.setHeader('Set-Cookie', stateCookie);
  res.redirect(`${FACEBOOK_AUTH_URL}?${params.toString()}`);
}

