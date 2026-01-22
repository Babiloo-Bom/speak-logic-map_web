export interface IDataRequestGetMyRating {
  page: number;
  limit: number;
  used: string;
}

export interface IMyRatingItem {
  id: number;
  user_id: number;
  manager_id: number;
  project_id: string;
  created_at: string;
  used_at: string;
  used: boolean;
}

export interface IResponseGetMyRating {
  items: IMyRatingItem[];
  total: number;
}
