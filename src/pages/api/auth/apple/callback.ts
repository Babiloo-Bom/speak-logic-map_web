import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import {
  findOrCreateUserFromSocialLogin,
  findUserByEmail,
  generateTokens,
  storeRefreshToken,
} from '@/lib/auth';

const TOKEN_ENDPOINT = 'https://appleid.apple.com/auth/token';
const USERINFO_ENDPOINT = 'https://appleid.apple.com/auth/keys'; 

const parseCookies = (cookieHeader?: string): Record<string, string> => {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [key, ...value] = part.trim().split('=');
    if (key) acc[key] = value.join('=');
    return acc;
  }, {});
};

const buildErrorRedirect = (baseUrl: string, code: string) =>
  `${baseUrl}/auth/sign-in?error=${code}`;

const generateClientSecret = () => {
  const teamId = process.env.APPLE_TEAM_ID!;
  const clientId = process.env.APPLE_CLIENT_ID!;
  const keyId = process.env.APPLE_KEY_ID!;
  const privateKey = process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, '\n');
  const token = jwt.sign(
    {
      iss: teamId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      aud: 'https://appleid.apple.com',
      sub: clientId,
    },
    privateKey,
    {
      algorithm: 'ES256',
      keyid: keyId,
    }
  );
  return token;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const clientId = process.env.APPLE_CLIENT_ID;
  if (!clientId) {
    console.error('Apple OAuth environment variables are not configured.');
    return res.redirect(buildErrorRedirect('/', 'apple_config'));
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  const { code, state } = req.body;

  if (typeof code !== 'string' || typeof state !== 'string') {
    return res.redirect(buildErrorRedirect(baseUrl, 'apple_invalid_response'));
  }

  try {
    const clientSecret = generateClientSecret();
    const redirectUri = `${baseUrl}/api/auth/apple/callback`;

    const tokenResponse = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to exchange Apple authorization code', await tokenResponse.text());
      return res.redirect(buildErrorRedirect(baseUrl, 'apple_token_error'));
    }

    const tokenData = await tokenResponse.json() as {
      access_token?: string;
      id_token?: string;
      refresh_token?: string;
      token_type?: string;
      expires_in?: number;
    };

    if (!tokenData.id_token) {
      console.error('Apple token response missing id_token', tokenData);
      return res.redirect(buildErrorRedirect(baseUrl, 'apple_token_missing'));
    }

    const decoded: any = jwt.decode(tokenData.id_token);

    if (!decoded || !decoded.email) {
      console.error('Apple Sign-In did not return an email address.', decoded);
      return res.redirect(buildErrorRedirect(baseUrl, 'apple_email_missing'));
    }

    const normalizedEmail = decoded.email.toLowerCase();
    
    const clearStateCookie = `apple_oauth_state=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`;

    const existingUser = await findUserByEmail(normalizedEmail);
    if (!existingUser) {
      res.setHeader('Set-Cookie', [clearStateCookie]);
      const encodedEmail = encodeURIComponent(normalizedEmail);
      return res.redirect(`/auth/sign-up?email=${encodedEmail}`);
    }

    if (existingUser.status === 'pending') {
      res.setHeader('Set-Cookie', clearStateCookie);
      return res.redirect(buildErrorRedirect(baseUrl, 'account_pending'));
    }

    if (existingUser.status === 'suspended') {
      res.setHeader('Set-Cookie', clearStateCookie);
      return res.redirect(buildErrorRedirect(baseUrl, 'account_suspended'));
    }

    const { user, profile } = await findOrCreateUserFromSocialLogin(
      existingUser.email,
    );

    const tokens = generateTokens(user);
    await storeRefreshToken(user.id, tokens.refreshToken);

    const refreshCookie = `refreshToken=${tokens.refreshToken}; HttpOnly; Path=/; Max-Age=${
      7 * 24 * 60 * 60
    }; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;

    res.setHeader('Set-Cookie', [refreshCookie, clearStateCookie]);

    const payload = {
      accessToken: tokens.accessToken,
      user,
      profile,
    };

    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
    const redirectUrl = `/auth/social-callback?provider=apple&data=${encodeURIComponent(encoded)}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('Apple login error:', error);
    return res.redirect(buildErrorRedirect(baseUrl, 'apple_unknown'));
  }
}
