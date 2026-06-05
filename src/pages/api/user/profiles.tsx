import type { NextApiResponse } from "next";
import {
  AuthenticatedRequest,
  getFileAssetById,
  getUserProfile,
  requireAuth,
} from "@/lib/auth";
import { getManagerByUserId } from "@/lib/managers";
import { getProviderByUserId } from "@/lib/providers";

const SELF_SERVICE_ROLES = ["user", "manager", "provider"] as const;
const PROFILE_REDIRECTS: Record<(typeof SELF_SERVICE_ROLES)[number], string> = {
  user: "/userprofile",
  manager: "/manager-profile",
  provider: "/provider-profile",
};

/**
 * GET /api/user/profiles
 * Returns the current user's account, base profile, and linked manager/provider records.
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = req.user!;
    const [baseProfile, manager, provider] = await Promise.all([
      getUserProfile(user.id),
      getManagerByUserId(user.id),
      getProviderByUserId(user.id),
    ]);

    let avatarUrl: string | null = null;
    if (baseProfile?.avatar_id) {
      const asset = await getFileAssetById(baseProfile.avatar_id);
      avatarUrl = asset?.url || null;
    }

    const profile = baseProfile ? { ...baseProfile, avatar_url: avatarUrl } : null;

    const profiles = SELF_SERVICE_ROLES.map((type) => {
      if (type === "user") {
        return {
          type,
          exists: true,
          id: user.id,
          redirectTo: PROFILE_REDIRECTS[type],
          profile,
        };
      }
      if (type === "manager") {
        return {
          type,
          exists: manager !== null,
          id: manager?.id ?? null,
          redirectTo: PROFILE_REDIRECTS[type],
          profile: manager,
        };
      }
      return {
        type,
        exists: provider !== null,
        id: provider?.id ?? null,
        redirectTo: PROFILE_REDIRECTS[type],
        profile: provider,
      };
    });

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
      },
      profile,
      manager,
      provider,
      profiles,
      availableRoles: user.role === "admin" ? [] : [...SELF_SERVICE_ROLES],
    });
  } catch (error) {
    console.error("Get user profiles error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default requireAuth()(handler);
