import type { NextApiResponse } from "next";
import type { AuthenticatedRequest } from "@/lib/auth";
import { requireAuth } from "@/lib/auth";
import pool from "@/lib/database";

/**
 * GET - View rating detail for a project identification.
 * Returns manager rating (or provider rating) linked to this project_id for the current user.
 */
const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { projectId, piId } = req.query as { projectId?: string | string[]; piId?: string | string[] };
  const userId = req.user.id;

  if (!projectId || typeof projectId !== "string") {
    return res.status(400).json({ error: "Invalid project ID" });
  }

  try {
    const client = await pool.connect();
    try {
      const baseSql = `SELECT id, user_id, project_id, used, manager_id, provider_id, created_at
                       FROM project_identifications
                       WHERE project_id = $1 AND user_id = $2`;

      const params: any[] = [projectId, userId];

      const useSingle =
        typeof piId === "string" && piId.trim().length > 0 && Number.isInteger(Number(piId));

      const sql = useSingle
        ? `${baseSql} AND id = $3 ORDER BY created_at DESC`
        : `${baseSql} ORDER BY created_at DESC`;

      if (useSingle) {
        params.push(Number(piId));
      }

      const piResult = await client.query(sql, params);
      if (piResult.rows.length === 0) {
        return res.status(404).json({ error: "Project identification not found" });
      }

      const items: any[] = [];

      for (const pi of piResult.rows) {
        const managerId = pi.manager_id ? Number(pi.manager_id) : null;
        const providerId = pi.provider_id ? Number(pi.provider_id) : null;

        if (managerId) {
          const mrResult = await client.query(
            `SELECT mr.*, m.is_given_set
             FROM manager_ratings mr
             LEFT JOIN managers m ON m.id = mr.manager_id
             WHERE mr.manager_id = $1 AND mr.user_id = $2
             ORDER BY mr.created_at DESC
             LIMIT 1`,
            [managerId, userId]
          );
          if (mrResult.rows.length === 0) {
            items.push({
              type: "manager",
              project_id: pi.project_id,
              used: pi.used,
              manager_id: managerId,
              rating: null,
              is_given_set: null,
            });
          } else {
            const row = mrResult.rows[0];
            items.push({
              type: "manager",
              project_id: pi.project_id,
              used: pi.used,
              manager_id: managerId,
              manager_name: row.manager_name ?? undefined,
              manager_user_name: row.manager_user_name ?? undefined,
              manager_location: row.manager_location ?? undefined,
              job_location: row.job_location ?? undefined,
              manager_url: row.manager_url ?? undefined,
              reviewer_phone: row.reviewer_phone ?? undefined,
              function_name: row.function_name ?? undefined,
              function_manager: row.function_manager ?? undefined,
              problem_to_be_solved: row.problem_to_be_solved ?? undefined,
              problem_solver_manager_name: row.problem_solver_manager_name ?? undefined,
              manager_helped_identify_problem: row.manager_helped_identify_problem ?? undefined,
              function_solved_problem: row.function_solved_problem ?? undefined,
              problem_existed_before_function: row.problem_existed_before_function ?? undefined,
              problem_existed_after_function: row.problem_existed_after_function ?? undefined,
              function_provided_solved_problem: row.function_provided_solved_problem ?? undefined,
              provided_feedback_after_function: row.provided_feedback_after_function ?? undefined,
              manager_applied_feedback: row.manager_applied_feedback ?? undefined,
              rating: row.rating != null ? Number(row.rating) : undefined,
              comment: row.comment ?? undefined,
              is_given_set: row.is_given_set != null ? !!row.is_given_set : undefined,
            });
          }
          continue;
        }

        if (providerId) {
          const prResult = await client.query(
            `SELECT pr.*, p.name as provider_name
             FROM provider_ratings pr
             LEFT JOIN providers p ON p.id = pr.provider_id
             WHERE pr.provider_id = $1 AND pr.user_id = $2
             ORDER BY pr.created_at DESC
             LIMIT 1`,
            [providerId, userId]
          );
          if (prResult.rows.length === 0) {
            items.push({
              type: "provider",
              project_id: pi.project_id,
              used: pi.used,
              provider_id: providerId,
              rating: null,
            });
          } else {
            const row = prResult.rows[0];
            items.push({
              type: "provider",
              project_id: pi.project_id,
              used: pi.used,
              provider_id: providerId,
              provider_name: row.provider_name ?? undefined,
              rating: row.rating != null ? Number(row.rating) : undefined,
              comment: row.comment ?? undefined,
            });
          }
          continue;
        }

        items.push({
          type: null,
          project_id: pi.project_id,
          used: pi.used,
        });
      }

      return res.status(200).json({ items });
    } finally {
      client.release();
    }
  } catch (e) {
    console.error("View rating error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default requireAuth([])(handler);
