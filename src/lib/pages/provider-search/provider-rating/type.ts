// Step 1: About User
// Step 2: About Provider
// Step 3: About Function And Problem
// Step 4: About Feedback (if yes) | About Feedback (if no)

export interface InitialUserData {
  user_name?: string;
  full_name?: string;
  email_address?: string;
  phone_number?: string;
  address_optional?: string;
}

export interface IProviderRatingRequest {
  // Step 1 - About User
  user_name: string;
  full_name: string;
  email_address: string;
  phone_number: string;
  address_optional: string;

  // Step 2 - About Provider
  provider_name: string;
  provider_address: string;
  provider_url: string;
  person_name: string;
  person_phone: string;

  // Step 3 - About Function And Problem
  function_name: string;
  problem_solved: string;
  used_function_from_provider: boolean;

  // Step 4 (if yes) - About Feedback
  function_execution_date: string;
  problem_to_be_solved: string;
  problem_existed_before_function: boolean;
  function_provided_solved_problem: boolean;
  person_from_provider: string;
  function_solved_problem: boolean;
  problem_existed_after_function: boolean;

  // Step 4 (if no) - About Feedback
  provided_feedback_after_function: boolean;
  provider_applied_feedback: boolean;

  // Submitted to API
  rating: number; // 1-5
  comment?: string;
  /** Optional: paste from My Ratings to link this rating so it appears in View Rating */
  project_id?: string;
}
