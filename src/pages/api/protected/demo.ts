import type { NextApiResponse } from 'next';
import { AuthenticatedRequest, requireAuth } from '@/lib/auth';

// Demo endpoint that requires authentication
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = req.user!;

  res.status(200).json({
    message: 'This is a protected endpoint',
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    timestamp: new Date().toISOString(),
    serverMessage: `Hello ${user.email}! You have ${user.role} role access.`,
  });
}

export default requireAuth()(handler);


