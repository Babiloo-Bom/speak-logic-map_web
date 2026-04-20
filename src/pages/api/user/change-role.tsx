import type { NextApiResponse } from 'next';
import { AuthenticatedRequest, ensureManagerForUser, ensureProviderForUser, requireAuth, updateUserRole } from '@/lib/auth';

interface ChangeRoleRequest {
  role: string;
}

/**
 * Self-service account type switching:
 * - default after register: user
 * - user can switch between user/manager/provider from profile
 * - user MUST NOT be able to self-escalate to admin (or other privileged roles)
 */
const VALID_SELF_SERVICE_ROLES = ['user', 'manager', 'provider'] as const;

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = req.user!;
    const { role }: ChangeRoleRequest = req.body;

    if (!role || !(VALID_SELF_SERVICE_ROLES as readonly string[]).includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role. Valid roles are: ' + VALID_SELF_SERVICE_ROLES.join(', ') 
      });
    }

    // Block privileged accounts from downgrading/upgrading via this endpoint.
    // Admin role changes should be handled in admin-only APIs.
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Admin role cannot be changed from profile' });
    }

    // Self-service: change own account type
    await updateUserRole(user.id, role);

    // Create/init corresponding profile record when switching type
    let createdProfile: { type: 'manager' | 'provider'; id: number; redirectTo: string } | null = null;
    if (role === 'manager') {
      const id = await ensureManagerForUser(user.id);
      createdProfile = { type: 'manager', id, redirectTo: '/manager-profile' };
    } else if (role === 'provider') {
      const id = await ensureProviderForUser(user.id);
      createdProfile = { type: 'provider', id, redirectTo: '/provider-profile' };
    }

    return res.status(200).json({
      message: 'Role updated successfully',
      newRole: role,
      profile: createdProfile,
    });
  } catch (error) {
    console.error('Change role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAuth()(handler);


