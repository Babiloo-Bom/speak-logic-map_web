import type { NextApiResponse } from "next";
import type { AuthenticatedRequest } from "@/lib/auth";
import { requireAuth } from "@/lib/auth";
import pool from "@/lib/database";

const ALLOWED_QUESTIONS = [
  "manager_helped_identify_problem",
  "function_solved_problem",
  "manager_applied_feedback",
] as const;

type QuestionKey = (typeof ALLOWED_QUESTIONS)[number];

/**
 * GET - Function trends by date for a given Yes/No question from manager_ratings.
 * Query: from (YYYY-MM-DD), to (YYYY-MM-DD), question (one of ALLOWED_QUESTIONS).
 * Returns { data: [ { date, Yes, No, "No issue" } ] } with percentages 0-100.
 */
const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const fromStr = typeof req.query.from === "string" ? req.query.from.trim() : "";
  const toStr = typeof req.query.to === "string" ? req.query.to.trim() : "";
  const question = typeof req.query.question === "string" ? req.query.question.trim() : "";

  if (!ALLOWED_QUESTIONS.includes(question as QuestionKey)) {
    return res.status(400).json({ error: "Invalid or missing question parameter" });
  }

  const col = question as QuestionKey;
  const fromDate = fromStr || undefined;
  const toDate = toStr || undefined;

  const client = await pool.connect();
  try {
    // Default: last 30 days if no range provided
    const whereClause = fromDate && toDate
      ? "WHERE mr.updated_at >= $1::date AND mr.updated_at < ($2::date + interval '1 day')"
      : "WHERE mr.updated_at >= (CURRENT_DATE - interval '30 days') AND mr.updated_at < (CURRENT_DATE + interval '1 day')";
    const params = fromDate && toDate ? [fromDate, toDate] : [];

    const sql = `
      SELECT
        DATE(mr.updated_at) AS d,
        COUNT(*) FILTER (WHERE mr.${col} = true)::int AS yes_count,
        COUNT(*) FILTER (WHERE mr.${col} = false)::int AS no_count,
        COUNT(*) FILTER (WHERE mr.${col} IS NULL)::int AS no_issue_count,
        COUNT(*)::int AS total
      FROM manager_ratings mr
      ${whereClause}
      GROUP BY DATE(mr.updated_at)
      ORDER BY d ASC
    `;

    const result = await client.query(sql, params);
    const data = result.rows.map((row: { d: Date; yes_count: number; no_count: number; no_issue_count: number; total: number }) => {
      const total = Number(row.total) || 0;
      const yesCount = Number(row.yes_count) || 0;
      const noCount = Number(row.no_count) || 0;
      const noIssueCount = Number(row.no_issue_count) || 0;
      const yesPct = total > 0 ? Math.round((yesCount / total) * 100) : 0;
      const noPct = total > 0 ? Math.round((noCount / total) * 100) : 0;
      const noIssuePct = total > 0 ? Math.round((noIssueCount / total) * 100) : 0;
      const dateObj = row.d instanceof Date ? row.d : new Date(row.d as unknown as string);
      const dateStr = dateObj.toISOString().slice(0, 10);
      const dd = dateStr.slice(8, 10);
      const mm = dateStr.slice(5, 7);
      const yy = dateStr.slice(2, 4);
      return {
        date: `${dd}/${mm}/${yy}`,
        Yes: yesPct,
        No: noPct,
        "No issue": noIssuePct,
        "Yes/No": yesPct + noPct,
      };
    });

    return res.status(200).json({ data });
  } catch (e) {
    console.error("Trends API error:", e);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

export default requireAuth([])(handler);
