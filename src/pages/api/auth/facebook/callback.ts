import type { NextApiRequest, NextApiResponse } from 'next';
import {
  findOrCreateUserFromSocialLogin,
  findUserByEmail,
  generateTokens,
  storeRefreshToken,
} from '@/lib/auth';

const TOKEN_ENDPOINT = 'https://graph.facebook.com/v16.0/oauth/access_token';
const USERINFO_ENDPOINT = 'https://graph.facebook.com/me';

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

const getQueryParam = (req: NextApiRequest, name: string): string | undefined => {
  const value = req.query[name];
  if (Array.isArray(value)) {
    return value[0];
  }
  return typeof value === 'string' ? value : undefined;
};

const buildErrorRedirect = (code: string) => `/auth/sign-in?error=${code}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Facebook OAuth environment variables are not configured.');
    return res.redirect(buildErrorRedirect('facebook_config'));
  }

  const errorParam = getQueryParam(req, 'error');
  if (errorParam) {
    return res.redirect(buildErrorRedirect(`facebook_${errorParam}`));
  }

  const code = getQueryParam(req, 'code');
  const state = getQueryParam(req, 'state');

  if (!code || !state) {
    return res.redirect(buildErrorRedirect('facebook_invalid_response'));
  }

  const cookies = parseCookies(req.headers.cookie);
  if (!cookies.facebook_oauth_state || cookies.facebook_oauth_state !== state) {
    return res.redirect(buildErrorRedirect('facebook_state_mismatch'));
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/auth/facebook/callback`;

  try {
    const tokenParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      client_secret: clientSecret,
      code,
    });

    const tokenResponse = await fetch(`${TOKEN_ENDPOINT}?${tokenParams.toString()}`);

    if (!tokenResponse.ok) {
      console.error('Failed to exchange Facebook authorization code', await tokenResponse.text());
      return res.redirect(buildErrorRedirect('facebook_token_error'));
    }

    const tokenData = await tokenResponse.json() as {
      access_token?: string;
      token_type?: string;
      expires_in?: number;
    };

    if (!tokenData.access_token) {
      console.error('Facebook token response missing access_token', tokenData);
      return res.redirect(buildErrorRedirect('facebook_token_missing'));
    }

    const userInfoParams = new URLSearchParams({
      access_token: tokenData.access_token,
      fields: 'id,email,first_name,last_name',
    });

    const userInfoResponse = await fetch(`${USERINFO_ENDPOINT}?${userInfoParams.toString()}`);

    if (!userInfoResponse.ok) {
      console.error('Failed to fetch Facebook user info', await userInfoResponse.text());
      return res.redirect(buildErrorRedirect('facebook_profile_error'));
    }

    const userInfo = await userInfoResponse.json() as {
      id?: string;
      email?: string;
      first_name?: string;
      last_name?: string;
      name?: string;
    };

    if (!userInfo.email) {
      console.error('Facebook Sign-In did not return an email address.');
      return res.redirect(buildErrorRedirect('facebook_email_missing'));
    }

    const clearStateCookie = `facebook_oauth_state=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`;

    const normalizedEmail = userInfo.email.toLowerCase();
    const existingUser = await findUserByEmail(normalizedEmail);

    if (!existingUser) {
      res.setHeader('Set-Cookie', clearStateCookie);
      return res.redirect('/auth/sign-up');
    }

    if (existingUser.status === 'pending') {
      res.setHeader('Set-Cookie', clearStateCookie);
      return res.redirect(buildErrorRedirect('account_pending'));
    }

    if (existingUser.status === 'suspended') {
      res.setHeader('Set-Cookie', clearStateCookie);
      return res.redirect(buildErrorRedirect('account_suspended'));
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
    const redirectUrl = `/auth/social-callback?provider=facebook&data=${encodeURIComponent(encoded)}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('Facebook login error:', error);
    return res.redirect(buildErrorRedirect('facebook_unknown'));
  }
}

