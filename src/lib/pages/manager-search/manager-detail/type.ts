export interface IManagerDetail {
  avatar: string;
  id: string;
  user_id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  name: string;
  description: string;
  expertise: string;
  rating: number;
  rating_count: number;
  is_given_set: boolean;
  lat: number;
  lng: number;
  first_name: string;
  last_name: string;
  title: string;
  function: string;
  functions: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
  }>;
  problems: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
  }>;
}

