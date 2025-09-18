import type { NextApiResponse } from 'next';
import { AuthenticatedRequest, requireAuth } from '@/lib/auth';

// Demo endpoint that requires admin role
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = req.user!;

  res.status(200).json({
    message: 'This is an admin-only endpoint',
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    timestamp: new Date().toISOString(),
    adminData: {
      totalUsers: 42, // Demo data
      systemHealth: 'Good',
      lastBackup: new Date().toISOString(),
    },
  });
}

export default requireAuth(['admin'])(handler);


