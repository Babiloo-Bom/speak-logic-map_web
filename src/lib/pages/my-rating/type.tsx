export interface IDataRequestGetMyRating {
  page: number;
  limit: number;
  used: string;
}

export interface IMyRatingItem {
  id: number;
  user_id: number;
  manager_id?: number | null;
  provider_id?: number | null;
  /** Provider đã gửi project_id cho user (chưa chắc đã rate) */
  sender_provider_id?: number | null;
  project_id: string;
  created_at: string;
  used_at?: string | null;
  used: boolean;
}

export interface IResponseGetMyRating {
  items: IMyRatingItem[];
  total: number;
}
