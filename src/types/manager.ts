// Types for Manager system (derived from users + profiles)

export interface Manager {
  id: number; // user id
  email: string;
  role: 'manager';
  status: string;
  created_at: string;

  // Joined profile fields
  first_name?: string;
  last_name?: string;
  title?: string;
  function?: string;
  location?: string;
  geo_id?: number;
  avatar_id?: number;
  pen_name?: string;
}

export interface ManagerSearchParams {
  q?: string; // search by name, email, title, function
  page?: number; // default 1
  limit?: number; // default 20
  status?: string; // filter by user.status
}

export interface ManagerSearchResponse {
  managers: Manager[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Payloads for creating/updating managers via API
export interface ManagerProfileInput {
  first_name?: string;
  last_name?: string;
  title?: string;
  function?: string;
  location?: string;
  geo_id?: number;
  avatar_id?: number;
  pen_name?: string;
}

export interface ManagerCreateInput {
  email: string;
  password: string;
  status?: string;
  profile?: ManagerProfileInput;
}

export interface ManagerUpdateInput {
  status?: string;
  password?: string;
  profile?: ManagerProfileInput;
}



