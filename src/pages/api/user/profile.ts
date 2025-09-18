import type { NextApiResponse } from 'next';
import { AuthenticatedRequest, requireAuth, getUserProfile, createOrUpdateProfile, findUserById } from '@/lib/auth';

interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  title?: string;
  function?: string;
  geoId?: number;
  avatarId?: number;
  penName?: string;
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const user = req.user!;
      const profile = await getUserProfile(user.id);
      
      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          created_at: user.created_at,
        },
        profile,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const user = req.user!;
      const {
        firstName,
        lastName,
        title,
        function: userFunction,
        geoId,
        avatarId,
        penName,
      }: ProfileUpdateRequest = req.body;

      const updatedProfile = await createOrUpdateProfile({
        user_id: user.id,
        first_name: firstName,
        last_name: lastName,
        title,
        function: userFunction,
        geo_id: geoId,
        avatar_id: avatarId,
        pen_name: penName,
      });

      res.status(200).json({
        message: 'Profile updated successfully',
        profile: updatedProfile,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAuth()(handler);


