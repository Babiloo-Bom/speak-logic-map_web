// Types for Manager system (derived from users + profiles + managers table)

export interface Manager {
  id: number; // manager id (from managers table)
  user_id: number; // user id
  email: string;
  role: 'manager';
  status: string;
  created_at: string;

  // Manager specific fields
  name: string;
  description?: string;
  expertise?: string;
  rating: number;
  rating_count: number;
  is_given_set: boolean;

  // Location fields
  geo_id?: number;
  lat?: number;
  lng?: number;
  city?: string;
  country?: string;

  // Joined profile fields
  first_name?: string;
  last_name?: string;
  title?: string;
  function?: string;
  location?: string;
  avatar_id?: number;
  avatar_url?: string;
  pen_name?: string;

  // Related data (populated on demand)
  functions?: ManagerFunction[];
  problems?: ManagerProblem[];

  // Computed fields (for search results)
  distance_km?: number; // Only when location search is used
}

export interface ManagerFunction {
  id: number;
  name: string;
  description?: string;
  category?: string;
}

export interface ManagerProblem {
  id: number;
  name: string;
  description?: string;
  category?: string;
}

// ============================================
// SEARCH PARAMS - Based on UI filters
// ============================================

export interface ManagerSearchParams {
  // ========== BROWSE Section ==========
  // Text search fields (can be combined with operation)
  q?: string;              // General search term
  managers?: string;       // Search by manager name
  problems?: string;       // Search by associated problems
  functions?: string;      // Search by associated functions
  expertise?: string;      // Search by expertise
  descriptions?: string;   // Search by description

  // ========== Operations Section ==========
  // How to combine search terms
  operation?: 'exact' | 'and' | 'or'; // Default: 'or'

  // ========== Ratings Section ==========
  rating?: '5' | '4' | '3' | 'below2'; // Shorthand rating filter
  rating_min?: number;     // Minimum rating (0-5)
  rating_max?: number;     // Maximum rating (0-5)

  // ========== The Given Set Section ==========
  given_set?: boolean;     // Filter managers using the given set

  // ========== Location By Section ==========
  near_city?: string;      // Search near a city name
  city_id?: number;        // Search near a city by ID
  lat?: number;            // Latitude for proximity search
  lng?: number;            // Longitude for proximity search
  radius?: number;         // Radius in km (default: 50)

  // ========== Alphabet Filter (A-Z sidebar) ==========
  starts_with?: string;    // Filter by first letter of name

  // ========== Pagination & Sorting ==========
  page?: number;           // Page number (default: 1)
  limit?: number;          // Items per page (default: 20, max: 100)
  sort_by?: 'name' | 'rating' | 'created_at' | 'distance'; // Sort field
  sort_order?: 'asc' | 'desc'; // Sort direction (default: 'desc')

  // ========== Other Filters ==========
  status?: string;         // Filter by status (active, pending, suspended)
  
  // ========== Include Related Data ==========
  include_functions?: boolean; // Include functions in response
  include_problems?: boolean;  // Include problems in response
}

// ============================================
// SEARCH RESPONSE
// ============================================

export interface ManagerSearchResponse {
  managers: Manager[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  // Echo back applied filters
  filters: Partial<ManagerSearchParams>;

  // Aggregations for UI counts
  aggregations?: ManagerAggregations;
}

export interface ManagerAggregations {
  // Counts for BROWSE section checkboxes
  total_managers: number;
  total_with_problems: number;
  total_with_functions: number;
  total_with_expertise: number;
  total_with_descriptions: number;

  // Counts by rating for Ratings section
  by_rating: {
    '5': number;
    '4': number;
    '3': number;
    'below2': number;
  };

  // Count for Given Set section
  total_in_given_set: number;

  // Counts by first letter for A-Z sidebar
  by_alphabet: Record<string, number>;
}

// ============================================
// CREATE/UPDATE PAYLOADS
// ============================================

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
  name: string;
  description?: string;
  expertise?: string;
  status?: string;
  is_given_set?: boolean;
  lat?: number;
  lng?: number;
  geo_id?: number;
  profile?: ManagerProfileInput;
  function_ids?: number[];  // IDs of functions to link
  problem_ids?: number[];   // IDs of problems to link
}

export interface ManagerUpdateInput {
  name?: string;
  description?: string;
  expertise?: string;
  status?: string;
  password?: string;
  is_given_set?: boolean;
  lat?: number;
  lng?: number;
  geo_id?: number;
  profile?: ManagerProfileInput;
  function_ids?: number[];  // Replace all linked functions
  problem_ids?: number[];   // Replace all linked problems
}

// ============================================
// RATING TYPES
// ============================================

export interface ManagerRating {
  id: number;
  manager_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  // Joined user info
  user_name?: string;
  user_email?: string;
}

export interface ManagerRatingInput {
  rating: number; // 1-5
  comment?: string;
}
