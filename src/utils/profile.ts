export interface ApiUserProfile {
  user_id: number;
  first_name?: string;
  last_name?: string;
  title?: string;
  function?: string;
  geo_id?: number;
  avatar_id?: number;
  pen_name?: string;
}

export async function fetchCurrentProfile(getAuthHeader: () => string | null): Promise<ApiUserProfile | null> {
  const auth = getAuthHeader();
  if (!auth) {
    return null;
  }
  const res = await fetch('/api/user/profile', {
    method: 'GET',
    headers: {
      'Authorization': auth,
    },
  });
  if (!res.ok) {
    return null;
  }
  const data = await res.json();
  return data?.profile ?? null;
}



