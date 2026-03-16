import type { NextApiResponse } from "next";
import type { AuthenticatedRequest } from "@/lib/auth";
import { requireAuth } from "@/lib/auth";
import { getManagerById } from "@/lib/managers";
import pool from "@/lib/database";

// ============================================
// Types
// ============================================

/**
 * Step 1: About User (Reviewer Info)
 */
export interface AboutUser {
  reviewer_name?: string;           // User Name
  reviewer_full_name?: string;      // Full Name
  reviewer_email?: string;          // Email Address
  reviewer_phone?: string;          // Phone Number
  reviewer_address?: string;        // Address (Optional)
}

/**
 * Step 2: About Manager
 */
export interface AboutManager {
  manager_name?: string;            // Manager name
  manager_user_name?: string;       // User Name (of manager)
  manager_location?: string;        // Manager Location
  job_location?: string;            // Job Location
  manager_url?: string;             // Manager URL
}

/**
 * Step 3: About Function And Problem
 */
export interface AboutFunctionAndProblem {
  function_name?: string;                      // Function Name
  function_manager?: string;                   // Function Manager
  used_function_from_manager?: boolean;        // Did you use the function from the Manager?
  function_execution_date?: string;            // Function Execution Date (ISO date string)
  problem_solver_manager_name?: string;        // Manager name who helped you solve the problem?
  problem_to_be_solved?: string;               // Problem to be solved by the function executed by the Manager
  manager_helped_identify_problem?: boolean;   // Did the manager help you identify the problem properly?
  function_solved_problem?: boolean;           // Did the function solve the problem?
  problem_existed_before_function?: boolean;   // Did the problem exist before the function executed by the Manager?
  problem_existed_after_function?: boolean;    // Did the problem exist after the function executed by the Manager?
  function_provided_solved_problem?: boolean;  // Is the function provided by the Manager solved the problem?
}

/**
 * Step 4: About Feedback
 */
export interface AboutFeedback {
  provided_feedback_after_function?: boolean;  // Did you provide feedback to the Manager after function executed?
  manager_applied_feedback?: boolean;          // Did the Manager apply the feedback to help solve the problem?
}

/**
 * Complete Manager Rating Request Body
 */
export interface ManagerRatingRequest extends AboutUser, AboutManager, AboutFunctionAndProblem, AboutFeedback {
  rating?: number;    // Overall rating (1-5, optional - can be computed)
  comment?: string;   // Additional comments
}

/**
 * Manager Rating Response
 */
export interface ManagerRating extends ManagerRatingRequest {
  id: number;
  manager_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
}

export interface ManagerRatingSummary {
  averageRating: number;
  ratingCount: number;
  ratings: ManagerRating[];
}

// ============================================
// Get Manager Rating Summary
// ============================================

async function getManagerRatingSummary(
  managerId: number
): Promise<ManagerRatingSummary> {
  const client = await pool.connect();

  try {
    // Get average and count
    const summaryResult = await client.query(
      `
        SELECT
          COALESCE(AVG(rating)::numeric(3,2), 0) AS average_rating,
          COUNT(*)::int AS rating_count
        FROM manager_ratings
        WHERE manager_id = $1
      `,
      [managerId]
    );

    const { average_rating, rating_count } = summaryResult.rows[0] ?? {
      average_rating: 0,
      rating_count: 0,
    };
    const avg = Number(average_rating ?? 0);

    // Get all ratings with user info
    const ratingsResult = await client.query(
      `
        SELECT 
          mr.*,
          u.email,
          COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '') as user_name
        FROM manager_ratings mr
        LEFT JOIN users u ON u.id = mr.user_id
        LEFT JOIN profiles p ON p.user_id = mr.user_id
        WHERE mr.manager_id = $1
        ORDER BY mr.created_at DESC
      `,
      [managerId]
    );

    return {
      averageRating: avg,
      ratingCount: Number(rating_count ?? 0),
      ratings: ratingsResult.rows.map((row) => ({
        id: row.id,
        manager_id: row.manager_id,
        user_id: row.user_id,
        // Step 1: About User
        reviewer_name: row.reviewer_name ?? undefined,
        reviewer_full_name: row.reviewer_full_name ?? undefined,
        reviewer_email: row.reviewer_email ?? undefined,
        reviewer_phone: row.reviewer_phone ?? undefined,
        reviewer_address: row.reviewer_address ?? undefined,
        // Step 2: About Manager
        manager_name: row.manager_name ?? undefined,
        manager_user_name: row.manager_user_name ?? undefined,
        manager_location: row.manager_location ?? undefined,
        job_location: row.job_location ?? undefined,
        manager_url: row.manager_url ?? undefined,
        // Step 3: About Function And Problem
        function_name: row.function_name ?? undefined,
        function_manager: row.function_manager ?? undefined,
        used_function_from_manager: row.used_function_from_manager ?? undefined,
        function_execution_date: row.function_execution_date ?? undefined,
        problem_solver_manager_name: row.problem_solver_manager_name ?? undefined,
        problem_to_be_solved: row.problem_to_be_solved ?? undefined,
        manager_helped_identify_problem: row.manager_helped_identify_problem ?? undefined,
        function_solved_problem: row.function_solved_problem ?? undefined,
        problem_existed_before_function: row.problem_existed_before_function ?? undefined,
        problem_existed_after_function: row.problem_existed_after_function ?? undefined,
        function_provided_solved_problem: row.function_provided_solved_problem ?? undefined,
        // Step 4: About Feedback
        provided_feedback_after_function: row.provided_feedback_after_function ?? undefined,
        manager_applied_feedback: row.manager_applied_feedback ?? undefined,
        // Legacy/Computed
        rating: row.rating ? Number(row.rating) : undefined,
        comment: row.comment ?? undefined,
        created_at: row.created_at,
        updated_at: row.updated_at,
        user_email: row.email,
        user_name: row.user_name?.trim() || undefined,
      })),
    };
  } finally {
    client.release();
  }
}

// ============================================
// Upsert Manager Rating (with summary update)
// ============================================

async function upsertManagerRating(
  managerId: number,
  userId: number,
  data: ManagerRatingRequest
): Promise<ManagerRatingSummary> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Insert or update rating with all fields
    await client.query(
      `
        INSERT INTO manager_ratings (
          manager_id, user_id,
          -- Step 1: About User
          reviewer_name, reviewer_full_name, reviewer_email, reviewer_phone, reviewer_address,
          -- Step 2: About Manager
          manager_name, manager_user_name, manager_location, job_location, manager_url,
          -- Step 3: About Function And Problem
          function_name, function_manager, used_function_from_manager, function_execution_date,
          problem_solver_manager_name, problem_to_be_solved, manager_helped_identify_problem,
          function_solved_problem, problem_existed_before_function, problem_existed_after_function,
          function_provided_solved_problem,
          -- Step 4: About Feedback
          provided_feedback_after_function, manager_applied_feedback,
          -- Legacy
          rating, comment,
          updated_at
        )
        VALUES (
          $1, $2,
          $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12,
          $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23,
          $24, $25,
          $26, $27,
          CURRENT_TIMESTAMP
        )
        ON CONFLICT (manager_id, user_id)
        DO UPDATE SET
          -- Step 1: About User
          reviewer_name = COALESCE(EXCLUDED.reviewer_name, manager_ratings.reviewer_name),
          reviewer_full_name = COALESCE(EXCLUDED.reviewer_full_name, manager_ratings.reviewer_full_name),
          reviewer_email = COALESCE(EXCLUDED.reviewer_email, manager_ratings.reviewer_email),
          reviewer_phone = COALESCE(EXCLUDED.reviewer_phone, manager_ratings.reviewer_phone),
          reviewer_address = COALESCE(EXCLUDED.reviewer_address, manager_ratings.reviewer_address),
          -- Step 2: About Manager
          manager_name = COALESCE(EXCLUDED.manager_name, manager_ratings.manager_name),
          manager_user_name = COALESCE(EXCLUDED.manager_user_name, manager_ratings.manager_user_name),
          manager_location = COALESCE(EXCLUDED.manager_location, manager_ratings.manager_location),
          job_location = COALESCE(EXCLUDED.job_location, manager_ratings.job_location),
          manager_url = COALESCE(EXCLUDED.manager_url, manager_ratings.manager_url),
          -- Step 3: About Function And Problem
          function_name = COALESCE(EXCLUDED.function_name, manager_ratings.function_name),
          function_manager = COALESCE(EXCLUDED.function_manager, manager_ratings.function_manager),
          used_function_from_manager = COALESCE(EXCLUDED.used_function_from_manager, manager_ratings.used_function_from_manager),
          function_execution_date = COALESCE(EXCLUDED.function_execution_date, manager_ratings.function_execution_date),
          problem_solver_manager_name = COALESCE(EXCLUDED.problem_solver_manager_name, manager_ratings.problem_solver_manager_name),
          problem_to_be_solved = COALESCE(EXCLUDED.problem_to_be_solved, manager_ratings.problem_to_be_solved),
          manager_helped_identify_problem = COALESCE(EXCLUDED.manager_helped_identify_problem, manager_ratings.manager_helped_identify_problem),
          function_solved_problem = COALESCE(EXCLUDED.function_solved_problem, manager_ratings.function_solved_problem),
          problem_existed_before_function = COALESCE(EXCLUDED.problem_existed_before_function, manager_ratings.problem_existed_before_function),
          problem_existed_after_function = COALESCE(EXCLUDED.problem_existed_after_function, manager_ratings.problem_existed_after_function),
          function_provided_solved_problem = COALESCE(EXCLUDED.function_provided_solved_problem, manager_ratings.function_provided_solved_problem),
          -- Step 4: About Feedback
          provided_feedback_after_function = COALESCE(EXCLUDED.provided_feedback_after_function, manager_ratings.provided_feedback_after_function),
          manager_applied_feedback = COALESCE(EXCLUDED.manager_applied_feedback, manager_ratings.manager_applied_feedback),
          -- Legacy
          rating = COALESCE(EXCLUDED.rating, manager_ratings.rating),
          comment = COALESCE(EXCLUDED.comment, manager_ratings.comment),
          updated_at = CURRENT_TIMESTAMP
      `,
      [
        managerId, userId,
        // Step 1
        data.reviewer_name ?? null,
        data.reviewer_full_name ?? null,
        data.reviewer_email ?? null,
        data.reviewer_phone ?? null,
        data.reviewer_address ?? null,
        // Step 2
        data.manager_name ?? null,
        data.manager_user_name ?? null,
        data.manager_location ?? null,
        data.job_location ?? null,
        data.manager_url ?? null,
        // Step 3
        data.function_name ?? null,
        data.function_manager ?? null,
        data.used_function_from_manager ?? null,
        (data.function_execution_date && String(data.function_execution_date).trim()) ? data.function_execution_date : null,
        data.problem_solver_manager_name ?? null,
        data.problem_to_be_solved ?? null,
        data.manager_helped_identify_problem ?? null,
        data.function_solved_problem ?? null,
        data.problem_existed_before_function ?? null,
        data.problem_existed_after_function ?? null,
        data.function_provided_solved_problem ?? null,
        // Step 4
        data.provided_feedback_after_function ?? null,
        data.manager_applied_feedback ?? null,
        // Legacy
        data.rating ?? null,
        data.comment ?? null,
      ]
    );

    // Recalculate average rating and update managers table
    const summaryResult = await client.query(
      `
        SELECT
          COALESCE(AVG(rating)::numeric(3,2), 0) AS average_rating,
          COUNT(*)::int AS rating_count
        FROM manager_ratings
        WHERE manager_id = $1
      `,
      [managerId]
    );

    const { average_rating, rating_count } = summaryResult.rows[0];
    const avg = Number(average_rating ?? 0);

    // Update manager's rating and rating_count
    await client.query(
      `
        UPDATE managers
        SET rating = $2,
            rating_count = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
      [managerId, avg, rating_count]
    );

    await client.query("COMMIT");

    // Return updated summary
    return getManagerRatingSummary(managerId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// ============================================
// Get User's Rating for a Manager
// ============================================

async function getUserRatingForManager(
  managerId: number,
  userId: number
): Promise<ManagerRating | null> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
        SELECT 
          mr.*,
          u.email,
          COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '') as user_name
        FROM manager_ratings mr
        LEFT JOIN users u ON u.id = mr.user_id
        LEFT JOIN profiles p ON p.user_id = mr.user_id
        WHERE mr.manager_id = $1 AND mr.user_id = $2
      `,
      [managerId, userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      manager_id: row.manager_id,
      user_id: row.user_id,
      // Step 1: About User
      reviewer_name: row.reviewer_name ?? undefined,
      reviewer_full_name: row.reviewer_full_name ?? undefined,
      reviewer_email: row.reviewer_email ?? undefined,
      reviewer_phone: row.reviewer_phone ?? undefined,
      reviewer_address: row.reviewer_address ?? undefined,
      // Step 2: About Manager
      manager_name: row.manager_name ?? undefined,
      manager_user_name: row.manager_user_name ?? undefined,
      manager_location: row.manager_location ?? undefined,
      job_location: row.job_location ?? undefined,
      manager_url: row.manager_url ?? undefined,
      // Step 3: About Function And Problem
      function_name: row.function_name ?? undefined,
      function_manager: row.function_manager ?? undefined,
      used_function_from_manager: row.used_function_from_manager ?? undefined,
      function_execution_date: row.function_execution_date ?? undefined,
      problem_solver_manager_name: row.problem_solver_manager_name ?? undefined,
      problem_to_be_solved: row.problem_to_be_solved ?? undefined,
      manager_helped_identify_problem: row.manager_helped_identify_problem ?? undefined,
      function_solved_problem: row.function_solved_problem ?? undefined,
      problem_existed_before_function: row.problem_existed_before_function ?? undefined,
      problem_existed_after_function: row.problem_existed_after_function ?? undefined,
      function_provided_solved_problem: row.function_provided_solved_problem ?? undefined,
      // Step 4: About Feedback
      provided_feedback_after_function: row.provided_feedback_after_function ?? undefined,
      manager_applied_feedback: row.manager_applied_feedback ?? undefined,
      // Legacy/Computed
      rating: row.rating ? Number(row.rating) : undefined,
      comment: row.comment ?? undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user_email: row.email,
      user_name: row.user_name?.trim() || undefined,
    };
  } finally {
    client.release();
  }
}

// ============================================
// API Handler
// ============================================

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const managerId = parseInt(String(id), 10);

  if (!managerId || Number.isNaN(managerId)) {
    return res.status(400).json({ error: "Invalid manager id" });
  }

  try {
    // Check if manager exists
    const manager = await getManagerById(managerId);
    if (!manager) {
      return res.status(404).json({ error: "Manager not found" });
    }

    // GET - Get rating summary or user's own rating
    if (req.method === "GET") {
      const { my_rating } = req.query;
      
      // If requesting user's own rating
      if (my_rating === "true" && req.user) {
        const userRating = await getUserRatingForManager(managerId, req.user.id);
        return res.status(200).json(userRating);
      }
      
      // Otherwise return full summary
      const summary = await getManagerRatingSummary(managerId);
      return res.status(200).json(summary);
    }

    // POST - Add/Update rating
    if (req.method === "POST") {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const body = req.body ?? {};
      const data: ManagerRatingRequest = body;
      const projectId = typeof body.project_id === "string" ? body.project_id.trim().toUpperCase() || null : null;

      // Validate rating if provided (DB column is integer, so round to 1-5)
      if (data.rating !== undefined && data.rating !== null) {
        const numericRating = Number(data.rating);
        if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
          return res.status(400).json({ error: "Rating must be between 1 and 5" });
        }
        data.rating = Math.round(numericRating);
      }

      const summary = await upsertManagerRating(managerId, req.user.id, data);

      // For each rating with a projectId, create a dedicated project_identifications row (1-n)
      if (projectId) {
        await pool.query(
          `
          INSERT INTO project_identifications (user_id, project_id, used, manager_id, created_at, used_at)
          VALUES ($1, $2, true, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `,
          [req.user.id, projectId, managerId]
        );
      }

      return res.status(200).json(summary);
    }

    // DELETE - Remove user's rating
    if (req.method === "DELETE") {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        // Delete the rating
        await client.query(
          `DELETE FROM manager_ratings WHERE manager_id = $1 AND user_id = $2`,
          [managerId, req.user.id]
        );

        // Recalculate average
        const summaryResult = await client.query(
          `
            SELECT
              COALESCE(AVG(rating)::numeric(3,2), 0) AS average_rating,
              COUNT(*)::int AS rating_count
            FROM manager_ratings
            WHERE manager_id = $1
          `,
          [managerId]
        );

        const { average_rating, rating_count } = summaryResult.rows[0];

        // Update manager
        await client.query(
          `
            UPDATE managers
            SET rating = $2,
                rating_count = $3,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
          `,
          [managerId, average_rating, rating_count]
        );

        await client.query("COMMIT");

        return res.status(200).json({ 
          message: "Rating deleted successfully",
          averageRating: Number(average_rating),
          ratingCount: Number(rating_count)
        });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error handling manager rating:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Getting and posting ratings requires authentication
export default requireAuth([])(handler);
