// Manager info from /api/managers/:id
export interface IManagerDetail {
  id: string;
  user_id: string;
  name: string;
  avatar: string;
  email: string;
  role: string;
  status: string;
  description: string;
  expertise: string;
  title: string;
  first_name: string;
  last_name: string;
  is_given_set: boolean;
  lat: number;
  lng: number;
  created_at: string;
  updated_at: string;
  function: string;
  functions: IFunction[];
  problems: IProblem[];
}

// Function object
export interface IFunction {
  id: string;
  name: string;
  description: string;
  category: string;
}

// Problem object
export interface IProblem {
  id: string;
  name: string;
  description: string;
  category: string;
}

// Manager rating from /api/managers/:id/rating
export interface IManagerRating {
  id: string;
  manager_id: string;
  user_id: string;
  reviewer_name: string;
  reviewer_full_name: string;
  reviewer_email: string;
  reviewer_phone: string;
  reviewer_address: string;
  manager_name: string;
  manager_user_name: string;
  manager_location: string;
  job_location: string;
  manager_url: string;
  function_name: string;
  function_manager: string;
  used_function_from_manager: boolean;
  function_execution_date: string;
  problem_solver_manager_name: string;
  problem_to_be_solved: string;
  manager_helped_identify_problem: boolean;
  function_solved_problem: boolean;
  problem_existed_before_function: boolean;
  problem_existed_after_function: boolean;
  function_provided_solved_problem: boolean;
  provided_feedback_after_function: boolean;
  manager_applied_feedback: boolean;
  created_at: string;
  updated_at: string;
  user_email: string;
  user_name: string;
}

// Combined type for manager detail page
export interface IManagerDetailWithRating extends IManagerDetail, IManagerRating {
  rating: number;
  rating_count: number;
}
