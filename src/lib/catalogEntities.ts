import pool from "./database";

const MAX_NAME = 255;

function clipName(name: string): string {
  const t = name.trim();
  if (!t) throw new Error("Name is required");
  return t.length > MAX_NAME ? t.slice(0, MAX_NAME) : t;
}

/**
 * Insert or update function by unique name; returns id.
 */
export async function getOrCreateFunction(name: string, description?: string | null): Promise<number> {
  const n = clipName(name);
  const client = await pool.connect();
  try {
    const result = await client.query(
      `
        INSERT INTO functions (name, description)
        VALUES ($1, $2)
        ON CONFLICT (name) DO UPDATE SET
          description = CASE
            WHEN EXCLUDED.description IS NOT NULL AND BTRIM(EXCLUDED.description) <> ''
            THEN EXCLUDED.description
            ELSE functions.description
          END,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `,
      [n, description?.trim() || null]
    );
    return result.rows[0].id as number;
  } finally {
    client.release();
  }
}

/**
 * Insert or update problem by unique name; returns id.
 */
export async function getOrCreateProblem(name: string, description?: string | null): Promise<number> {
  const n = clipName(name);
  const client = await pool.connect();
  try {
    const result = await client.query(
      `
        INSERT INTO problems (name, description)
        VALUES ($1, $2)
        ON CONFLICT (name) DO UPDATE SET
          description = CASE
            WHEN EXCLUDED.description IS NOT NULL AND BTRIM(EXCLUDED.description) <> ''
            THEN EXCLUDED.description
            ELSE problems.description
          END,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `,
      [n, description?.trim() || null]
    );
    return result.rows[0].id as number;
  } finally {
    client.release();
  }
}
