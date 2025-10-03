import type { NextApiResponse } from 'next';
import { AuthenticatedRequest, requireAuth, getUserProfile, createOrUpdateProfile, findUserById, getFileAssetById } from '@/lib/auth';

interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  title?: string;
  function?: string;
  location?: string;
  geoId?: number;
  avatarId?: number;
  penName?: string;
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const user = req.user!;
      const profile = await getUserProfile(user.id);
      let avatarUrl: string | null = null;
      if (profile?.avatar_id) {
        const asset = await getFileAssetById(profile.avatar_id);
        avatarUrl = asset?.url || null;
      }

      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          created_at: user.created_at,
        },
        profile: profile ? { ...profile, avatar_url: avatarUrl } : null,
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
        location,
        geoId,
        avatarId,
        penName,
      }: ProfileUpdateRequest = req.body;

      const existing = await getUserProfile(user.id);
      const updatedProfile = await createOrUpdateProfile({
        user_id: user.id,
        first_name: firstName ?? existing?.first_name,
        last_name: lastName ?? existing?.last_name,
        title: title ?? existing?.title,
        function: userFunction ?? existing?.function,
        location: location ?? existing?.location,
        geo_id: geoId ?? existing?.geo_id,
        avatar_id: avatarId ?? existing?.avatar_id,
        pen_name: penName ?? existing?.pen_name,
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


