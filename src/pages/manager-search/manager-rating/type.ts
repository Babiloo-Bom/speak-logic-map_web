export interface IDataRequestRating {
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
}
