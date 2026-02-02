// TypeScript types for Provider system

export interface Function {
  id: number;
  name: string;
  description?: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface Problem {
  id: number;
  name: string;
  description?: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: number;
  user_id: number;
  name: string;
  url?: string;  // Internal URL identifier (e.g., www.urlofprovider.com)
  website_url?: string;  // External website URL
  description?: string;
  image_url?: string;  // Provider image URL
  geo_id?: number;
  lat?: number;
  lng?: number;
  rating: number;  // 0.00 to 5.00
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  is_applicable: boolean;  // "The Given Set Applicable"
  created_at: string;
  updated_at: string;
  
  // Joined data (optional, populated by API)
  functions?: Function[];
  problems?: Problem[];
  geo?: {
    id: number;
    lat: number;
    lng: number;
    city?: string;
    country?: string;
  };
}

export interface ProviderWithRelations extends Provider {
  functions: Function[];
  problems: Problem[];
}

export interface ProviderSearchParams {
  q?: string;  // Search query
  sortBy?: 'all' | 'functions' | 'problems' | 'description' | 'provider';  // Default: 'all'
  page?: number;  // Default: 1
  limit?: number;  // Default: 20
  functionId?: number;
  problemId?: number;
  minRating?: number;
  applicable?: boolean;
}

export interface ProviderSearchResponse {
  providers: Provider[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProviderFunction {
  provider_id: number;
  function_id: number;
  created_at: string;
}

export interface ProviderProblem {
  provider_id: number;
  problem_id: number;
  created_at: string;
}

// ============================================
// CRUD INPUT TYPES
// ============================================

export interface ProviderCreateInput {
  name: string; // Required
  user_id?: number; // Optional - link to existing user
  url?: string;
  website_url?: string;
  description?: string;
  image_url?: string;
  geo_id?: number;
  lat?: number;
  lng?: number;
  near_city?: string;
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  is_applicable?: boolean;
  location_by?: boolean;
  function_ids?: number[]; // Link to functions
  problem_ids?: number[]; // Link to problems
}

export interface ProviderUpdateInput {
  name?: string;
  user_id?: number;
  url?: string;
  website_url?: string;
  description?: string;
  image_url?: string;
  geo_id?: number;
  lat?: number;
  lng?: number;
  near_city?: string;
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  is_applicable?: boolean;
  location_by?: boolean;
  function_ids?: number[]; // Replace all linked functions
  problem_ids?: number[]; // Replace all linked problems
}

