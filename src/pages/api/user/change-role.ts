import type { NextApiResponse } from 'next';
import { AuthenticatedRequest, requireAuth, updateUserRole } from '@/lib/auth';

interface ChangeRoleRequest {
  role: string;
}

const VALID_ROLES = ['user', 'admin', 'moderator', 'premium', 'provider'];

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = req.user!;
    const { role }: ChangeRoleRequest = req.body;

    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role. Valid roles are: ' + VALID_ROLES.join(', ') 
      });
    }

    // For demo purposes, allow users to change their own role
    // In production, this would typically require admin privileges
    await updateUserRole(user.id, role);

    res.status(200).json({
      message: 'Role updated successfully',
      newRole: role,
    });
  } catch (error) {
    console.error('Change role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAuth()(handler);


