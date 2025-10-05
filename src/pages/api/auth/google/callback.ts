import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createOrUpdateProfile, findOrCreateUserFromSocialLogin,
  findUserByEmail,
  generateTokens,
  getUserProfile,
  storeRefreshToken,
} from '@/lib/auth';

const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const USERINFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v2/userinfo';

const parseCookies = (cookieHeader?: string): Record<string, string> => {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [key, ...value] = part.trim().split('=');
    if (key) {
      acc[key] = value.join('=');
    }
    return acc;
  }, {});
};

const buildErrorRedirect = (baseUrl: string, code: string) => `${baseUrl}/auth/sign-in?error=${code}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  if (!clientId || !clientSecret) {
    console.error('Google OAuth environment variables are not configured.');
    return res.redirect(buildErrorRedirect(baseUrl, 'google_config'));
  }

  const { code, state } = req.query;

  if (typeof code !== 'string' || typeof state !== 'string') {
    return res.redirect(buildErrorRedirect(baseUrl, 'google_invalid_response'));
  }

  const cookies = parseCookies(req.headers.cookie);
  if (!cookies.google_oauth_state || cookies.google_oauth_state !== state) {
    return res.redirect(buildErrorRedirect(baseUrl, 'google_state_mismatch'));
  }

  try {
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    const tokenResponse = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to exchange Google authorization code', await tokenResponse.text());
      return res.redirect(buildErrorRedirect(baseUrl, 'google_token_error'));
    }

    const tokenData = await tokenResponse.json() as {
      access_token?: string;
      id_token?: string;
      refresh_token?: string;
      scope?: string;
      token_type?: string;
      expires_in?: number;
    };

    if (!tokenData.access_token) {
      console.error('Google token response missing access_token', tokenData);
      return res.redirect(buildErrorRedirect(baseUrl, 'google_token_missing'));
    }

    const userInfoResponse = await fetch(USERINFO_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      console.error('Failed to fetch Google user info', await userInfoResponse.text());
      return res.redirect(buildErrorRedirect(baseUrl, 'google_profile_error'));
    }

    const userInfo = await userInfoResponse.json() as {
      id?: string;
      email?: string;
      verified_email?: boolean;
      given_name?: string;
      family_name?: string;
      name?: string;
      picture?: string;
    };

    if (!userInfo.email || !userInfo.verified_email) {
      return res.redirect(buildErrorRedirect(baseUrl, 'google_email_unverified'));
    }

    const normalizedEmail = userInfo.email.toLowerCase();
    const clearStateCookie = `google_oauth_state=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''
      }`;

    // const existingUser = await findUserByEmail(normalizedEmail);

    // if (!existingUser) {
    //   res.setHeader('Set-Cookie', clearStateCookie);
    //   const encodedEmail = encodeURIComponent(normalizedEmail);
    //   return res.redirect(`/auth/sign-up?email=${encodedEmail}&sc=1`);
    // }

    // if (existingUser.status === 'pending') {
    //   res.setHeader('Set-Cookie', clearStateCookie);
    //   return res.redirect(buildErrorRedirect(baseUrl, 'account_pending'));
    // }

    // if (existingUser.status === 'suspended') {
    //   res.setHeader('Set-Cookie', clearStateCookie);
    //   return res.redirect(buildErrorRedirect(baseUrl, 'account_suspended'));
    // }

    // const { user, profile } = await findOrCreateUserFromSocialLogin(
    //   existingUser.email,
    // );

    const { user, profile } = await findOrCreateUserFromSocialLogin(
      normalizedEmail, userInfo.given_name, userInfo.family_name
    );

    const tokens = generateTokens(user);
    await storeRefreshToken(user.id, tokens.refreshToken);

    const refreshCookie = `refreshToken=${tokens.refreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60
      }; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;

    res.setHeader('Set-Cookie', [refreshCookie, clearStateCookie]);

    const payload = {
      accessToken: tokens.accessToken,
      user,
      profile,
    };

    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
    const redirectUrl = `/auth/social-callback?provider=google&data=${encodeURIComponent(encoded)}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google login error:', error);
    return res.redirect(buildErrorRedirect(baseUrl, 'google_unknown'));
  }
}
