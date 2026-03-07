export interface ProviderItem {
  id: string;
  user_id: string;
  email?: string;
  role?: string;
  status?: string;
  created_at?: string;
  name: string;
  description?: string;
  expertise?: string;
  rating?: number;
  rating_count?: number;
  is_given_set?: boolean;
  is_applicable?: boolean;
  lat?: number;
  lng?: number;
  first_name?: string;
  last_name?: string;
  title?: string;
  function?: string;
  image_url?: string;
  url?: string;
  website_url?: string;
  functions?: { id: number; name: string; description?: string }[];
  problems?: { id: number; name: string; description?: string }[];
}

export interface IDataRequestGetList {
  q: string;
  providers: string;
  problems: string;
  functions: string;
  expertise: string;
  descriptions: string;
  operation: string;
  rating: string;
  rating_min: string;
  rating_max: string;
  given_set: string;
  near_city: string;
  city_id: string;
  lat: string;
  lng: string;
  radius: string;
  starts_with: string;
  page: number;
  limit: number;
  sort_by: string;
  sort_order: string;
}

export interface IDataResponseGetList {
  total: number;
  page: number;
  limit: number;
  providers: ProviderItem[];
}
