import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  hasGoogleClientId: boolean;
  hasGoogleClientSecret: boolean;
  hasFacebookClientId: boolean;
  hasFacebookClientSecret: boolean;
  nextAuthUrl?: string;
  nodeEnv?: string;
};

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const facebookClientId = process.env.FACEBOOK_CLIENT_ID;
  const facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET;

  res.status(200).json({
    hasGoogleClientId: !!googleClientId,
    hasGoogleClientSecret: !!googleClientSecret,
    hasFacebookClientId: !!facebookClientId,
    hasFacebookClientSecret: !!facebookClientSecret,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV,
  });
}


