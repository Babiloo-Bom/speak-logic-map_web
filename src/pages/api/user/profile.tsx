import type { NextApiResponse } from 'next';
import { AuthenticatedRequest, requireAuth, getUserProfile, createOrUpdateProfile, findUserById, getFileAssetById } from '@/lib/auth';

interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  title?: string;
  function?: string;
  location?: string;
  phone?: string;
  website?: string;
  zipCode?: string;
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

      const fullName =
        profile ? [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() : '';

      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          created_at: user.created_at,
        },
        profile: profile ? { ...profile, avatar_url: avatarUrl, fullName } : null,
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
        fullName,
        title,
        function: userFunction,
        location,
        phone,
        website,
        zipCode,
        geoId,
        avatarId,
        penName,
      }: ProfileUpdateRequest = req.body;

      const existing = await getUserProfile(user.id);

      // Mobile may send a single fullName instead of firstName/lastName.
      // If firstName/lastName are missing, best-effort split fullName.
      const fullNameTrimmed = typeof fullName === 'string' ? fullName.trim() : '';
      const hasFirst = typeof firstName === 'string' && firstName.trim().length > 0;
      const hasLast = typeof lastName === 'string' && lastName.trim().length > 0;
      let derivedFirstName: string | undefined = undefined;
      let derivedLastName: string | undefined = undefined;
      if (!hasFirst && !hasLast && fullNameTrimmed.length > 0) {
        const parts = fullNameTrimmed.split(/\s+/).filter(Boolean);
        if (parts.length === 1) {
          derivedFirstName = parts[0];
          derivedLastName = '';
        } else {
          derivedFirstName = parts[0];
          derivedLastName = parts.slice(1).join(' ');
        }
      }

      const updatedProfile = await createOrUpdateProfile({
        user_id: user.id,
        first_name: (firstName ?? derivedFirstName) ?? existing?.first_name,
        last_name: (lastName ?? derivedLastName) ?? existing?.last_name,
        title: title ?? existing?.title,
        function: userFunction ?? existing?.function,
        location: location ?? existing?.location,
        phone: phone ?? existing?.phone,
        website: website ?? existing?.website,
        zip_code: zipCode ?? existing?.zip_code,
        geo_id: geoId ?? existing?.geo_id,
        avatar_id: avatarId ?? existing?.avatar_id,
        pen_name: penName ?? existing?.pen_name,
      });

      const responseFullName = [updatedProfile.first_name, updatedProfile.last_name]
        .filter(Boolean)
        .join(' ')
        .trim();

      res.status(200).json({
        message: 'Profile updated successfully',
        profile: { ...updatedProfile, fullName: responseFullName },
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


