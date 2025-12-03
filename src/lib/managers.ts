import pool from "@/lib/database";
import { createOrUpdateProfile, hashPassword } from "@/lib/auth";
import type {
  Manager,
  ManagerSearchParams,
  ManagerSearchResponse,
  ManagerCreateInput,
  ManagerUpdateInput,
} from "@/types/manager";

const toNumber = (value: any, defaultValue: number): number => {
  const n = parseInt(String(value), 10);
  return Number.isNaN(n) ? defaultValue : n;
};

export async function getManagerById(id: number): Promise<Manager | null> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
        SELECT
          u.id,
          u.email,
          u.role,
          u.status,
          u.created_at,
          p.first_name,
          p.last_name,
          p.title,
          p.function,
          p.location,
          p.geo_id,
          p.avatar_id,
          p.pen_name
        FROM users u
        LEFT JOIN profiles p ON p.user_id = u.id
        WHERE u.id = $1
          AND u.role = 'manager'
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const manager: Manager = {
      id: row.id,
      email: row.email,
      role: "manager",
      status: row.status,
      created_at: row.created_at,
      first_name: row.first_name ?? undefined,
      last_name: row.last_name ?? undefined,
      title: row.title ?? undefined,
      function: row.function ?? undefined,
      location: row.location ?? undefined,
      geo_id: row.geo_id ?? undefined,
      avatar_id: row.avatar_id ?? undefined,
      pen_name: row.pen_name ?? undefined,
    };

    return manager;
  } finally {
    client.release();
  }
}

export async function searchManagers(
  params: ManagerSearchParams
): Promise<ManagerSearchResponse> {
  const {
    q,
    status,
    page: rawPage,
    limit: rawLimit,
  } = params;

  const page = Math.max(toNumber(rawPage, 1), 1);
  const limit = Math.min(Math.max(toNumber(rawLimit, 20), 1), 100);
  const offset = (page - 1) * limit;

  const values: any[] = [];
  const where: string[] = ["u.role = 'manager'"];

  if (status) {
    values.push(status);
    where.push(`u.status = $${values.length}`);
  }

  if (q && q.trim().length > 0) {
    const term = `%${q.trim()}%`;
    values.push(term);
    const idx = values.length;
    where.push(
      `(u.email ILIKE $${idx}
        OR COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '') ILIKE $${idx}
        OR COALESCE(p.title, '') ILIKE $${idx}
        OR COALESCE(p.function, '') ILIKE $${idx})`
    );
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const client = await pool.connect();

  try {
    const countResult = await client.query(
      `
        SELECT COUNT(*) AS total
        FROM users u
        LEFT JOIN profiles p ON p.user_id = u.id
        ${whereSql}
      `,
      values
    );

    const total = Number(countResult.rows[0]?.total ?? 0);
    const totalPages = Math.ceil(total / limit) || 1;

    const dataResult = await client.query(
      `
        SELECT
          u.id,
          u.email,
          u.role,
          u.status,
          u.created_at,
          p.first_name,
          p.last_name,
          p.title,
          p.function,
          p.location,
          p.geo_id,
          p.avatar_id,
          p.pen_name
        FROM users u
        LEFT JOIN profiles p ON p.user_id = u.id
        ${whereSql}
        ORDER BY u.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      values
    );

    const managers: Manager[] = dataResult.rows.map((row) => ({
      id: row.id,
      email: row.email,
      role: "manager",
      status: row.status,
      created_at: row.created_at,
      first_name: row.first_name ?? undefined,
      last_name: row.last_name ?? undefined,
      title: row.title ?? undefined,
      function: row.function ?? undefined,
      location: row.location ?? undefined,
      geo_id: row.geo_id ?? undefined,
      avatar_id: row.avatar_id ?? undefined,
      pen_name: row.pen_name ?? undefined,
    }));

    return {
      managers,
      total,
      page,
      limit,
      totalPages,
    };
  } finally {
    client.release();
  }
}

export async function createManager(
  input: ManagerCreateInput
): Promise<Manager> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const passwordHash = await hashPassword(input.password);
    const status = input.status ?? "active";

    const userResult = await client.query(
      `
        INSERT INTO users (email, password_hash, role, status)
        VALUES ($1, $2, 'manager', $3)
        RETURNING id, email, role, status, created_at
      `,
      [input.email.toLowerCase(), passwordHash, status]
    );

    const userRow = userResult.rows[0];

    if (input.profile) {
      await createOrUpdateProfile({
        user_id: userRow.id,
        ...input.profile,
      });
    }

    await client.query("COMMIT");

    const manager: Manager = {
      id: userRow.id,
      email: userRow.email,
      role: "manager",
      status: userRow.status,
      created_at: userRow.created_at,
      first_name: input.profile?.first_name,
      last_name: input.profile?.last_name,
      title: input.profile?.title,
      function: input.profile?.function,
      location: input.profile?.location,
      geo_id: input.profile?.geo_id,
      avatar_id: input.profile?.avatar_id,
      pen_name: input.profile?.pen_name,
    };

    return manager;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateManager(
  id: number,
  input: ManagerUpdateInput
): Promise<Manager | null> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (input.status) {
      await client.query(
        `UPDATE users SET status = $2 WHERE id = $1 AND role = 'manager'`,
        [id, input.status]
      );
    }

    if (input.password) {
      const passwordHash = await hashPassword(input.password);
      await client.query(
        `UPDATE users SET password_hash = $2 WHERE id = $1 AND role = 'manager'`,
        [id, passwordHash]
      );
    }

    if (input.profile) {
      await createOrUpdateProfile({
        user_id: id,
        ...input.profile,
      });
    }

    await client.query("COMMIT");

    return await getManagerById(id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteManager(id: number): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query(
      `DELETE FROM users WHERE id = $1 AND role = 'manager'`,
      [id]
    );
  } finally {
    client.release();
  }
}



