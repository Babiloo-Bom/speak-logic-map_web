import pool from "@/lib/database";
import type {
  Provider,
  ProviderWithRelations,
  ProviderSearchParams,
  ProviderSearchResponse,
  ProviderCreateInput,
  ProviderUpdateInput,
  Function as ProviderFunction,
  Problem as ProviderProblem,
} from "@/types/provider";

// Helper to parse numbers safely from query strings
const toNumber = (value: any, defaultValue: number): number => {
  const n = parseInt(String(value), 10);
  return Number.isNaN(n) ? defaultValue : n;
};

export async function getProviderById(
  id: number
): Promise<ProviderWithRelations | null> {
  const client = await pool.connect();

  try {
    const providerResult = await client.query(
      `
        SELECT
          p.id,
          p.user_id,
          p.name,
          p.url,
          p.website_url,
          p.description,
          p.image_url,
          p.contact_number,
          p.address,
          p.map_image_url,
          p.geo_id,
          p.lat,
          p.lng,
          p.rating,
          p.status,
          p.is_applicable,
          p.created_at,
          p.updated_at,
          g.id        AS geo_id_resolved,
          g.lat       AS geo_lat,
          g.lng       AS geo_lng,
          g.city      AS geo_city,
          g.country   AS geo_country
        FROM providers p
        LEFT JOIN geopoints g ON p.geo_id = g.id
        WHERE p.id = $1
      `,
      [id]
    );

    if (providerResult.rows.length === 0) {
      return null;
    }

    const providerRow = providerResult.rows[0];

    const functionsResult = await client.query(
      `
        SELECT f.*
        FROM provider_functions pf
        JOIN functions f ON f.id = pf.function_id
        WHERE pf.provider_id = $1
        ORDER BY f.name ASC
      `,
      [id]
    );

    const problemsResult = await client.query(
      `
        SELECT pr.*
        FROM provider_problems pp
        JOIN problems pr ON pr.id = pp.problem_id
        WHERE pp.provider_id = $1
        ORDER BY pr.name ASC
      `,
      [id]
    );

    const provider: ProviderWithRelations = {
      id: providerRow.id,
      user_id: providerRow.user_id,
      name: providerRow.name,
      url: providerRow.url,
      website_url: providerRow.website_url,
      description: providerRow.description,
      image_url: providerRow.image_url ?? undefined,
      contact_number: providerRow.contact_number ?? undefined,
      address: providerRow.address ?? undefined,
      map_image_url: providerRow.map_image_url ?? undefined,
      geo_id: providerRow.geo_id,
      lat: providerRow.lat,
      lng: providerRow.lng,
      rating: Number(providerRow.rating ?? 0),
      status: providerRow.status,
      is_applicable: providerRow.is_applicable,
      created_at: providerRow.created_at,
      updated_at: providerRow.updated_at,
      functions: functionsResult.rows as ProviderFunction[],
      problems: problemsResult.rows as ProviderProblem[],
      geo: providerRow.geo_id_resolved
        ? {
            id: providerRow.geo_id_resolved,
            lat: Number(providerRow.geo_lat),
            lng: Number(providerRow.geo_lng),
            city: providerRow.geo_city ?? undefined,
            country: providerRow.geo_country ?? undefined,
          }
        : undefined,
    };

    return provider;
  } finally {
    client.release();
  }
}

export async function searchProviders(
  params: ProviderSearchParams
): Promise<ProviderSearchResponse> {
  const {
    q,
    sortBy = "all",
    page: rawPage,
    limit: rawLimit,
    functionId,
    problemId,
    minRating,
    applicable,
  } = params;

  const page = Math.max(toNumber(rawPage, 1), 1);
  const limit = Math.min(Math.max(toNumber(rawLimit, 20), 1), 100);
  const offset = (page - 1) * limit;

  const values: any[] = [];
  let whereClauses: string[] = ["p.status = 'active'"];

  if (typeof minRating === "number") {
    values.push(minRating);
    whereClauses.push(`p.rating >= $${values.length}`);
  }

  if (typeof applicable === "boolean") {
    values.push(applicable);
    whereClauses.push(`p.is_applicable = $${values.length}`);
  }

  if (functionId) {
    values.push(functionId);
    whereClauses.push(
      `EXISTS (SELECT 1 FROM provider_functions pf WHERE pf.provider_id = p.id AND pf.function_id = $${values.length})`
    );
  }

  if (problemId) {
    values.push(problemId);
    whereClauses.push(
      `EXISTS (SELECT 1 FROM provider_problems pp WHERE pp.provider_id = p.id AND pp.problem_id = $${values.length})`
    );
  }

  if (q && q.trim().length > 0) {
    const searchTerm = `%${q.trim()}%`;
    values.push(searchTerm);
    const searchIndex = values.length;

    const providerNameCond = `p.name ILIKE $${searchIndex} OR p.url ILIKE $${searchIndex}`;
    const descriptionCond = `p.description ILIKE $${searchIndex}`;
    const functionCond = `EXISTS (
      SELECT 1
      FROM provider_functions pf
      JOIN functions f ON f.id = pf.function_id
      WHERE pf.provider_id = p.id
        AND (f.name ILIKE $${searchIndex} OR COALESCE(f.description, '') ILIKE $${searchIndex})
    )`;
    const problemCond = `EXISTS (
      SELECT 1
      FROM provider_problems pp
      JOIN problems pr ON pr.id = pp.problem_id
      WHERE pp.provider_id = p.id
        AND (pr.name ILIKE $${searchIndex} OR COALESCE(pr.description, '') ILIKE $${searchIndex})
    )`;

    let textCondition: string;
    switch (sortBy) {
      case "provider":
        textCondition = `(${providerNameCond})`;
        break;
      case "description":
        textCondition = `(${descriptionCond})`;
        break;
      case "functions":
        textCondition = `(${functionCond})`;
        break;
      case "problems":
        textCondition = `(${problemCond})`;
        break;
      case "all":
      default:
        textCondition = `(${providerNameCond} OR ${descriptionCond} OR ${functionCond} OR ${problemCond})`;
        break;
    }

    whereClauses.push(textCondition);
  } else {
    // Khi không có ô tìm kiếm (q trống): filter theo sortBy để kết quả thay đổi khi đổi dropdown
    switch (sortBy) {
      case "functions":
        whereClauses.push(
          "EXISTS (SELECT 1 FROM provider_functions pf WHERE pf.provider_id = p.id)"
        );
        break;
      case "problems":
        whereClauses.push(
          "EXISTS (SELECT 1 FROM provider_problems pp WHERE pp.provider_id = p.id)"
        );
        break;
      case "description":
        whereClauses.push(
          "p.description IS NOT NULL AND TRIM(COALESCE(p.description, '')) != ''"
        );
        break;
      case "provider":
      case "all":
      default:
        break;
    }
  }

  const whereSql =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const orderBySql =
    sortBy === "functions"
      ? "ORDER BY (SELECT COUNT(*) FROM provider_functions pf WHERE pf.provider_id = p.id) DESC, p.rating DESC, p.created_at DESC"
      : sortBy === "problems"
      ? "ORDER BY (SELECT COUNT(*) FROM provider_problems pp WHERE pp.provider_id = p.id) DESC, p.rating DESC, p.created_at DESC"
      : sortBy === "description"
      ? "ORDER BY (CASE WHEN p.description IS NOT NULL AND TRIM(COALESCE(p.description, '')) != '' THEN 1 ELSE 0 END) DESC, p.rating DESC, p.created_at DESC"
      : "ORDER BY p.rating DESC, p.created_at DESC";

  const client = await pool.connect();

  try {
    // Count total
    const countResult = await client.query(
      `
        SELECT COUNT(DISTINCT p.id) AS total
        FROM providers p
        ${whereSql}
      `,
      values
    );

    const total: number = Number(countResult.rows[0]?.total ?? 0);
    const totalPages = Math.ceil(total / limit) || 1;

    // Fetch page of providers
    const providersResult = await client.query(
      `
        SELECT
          p.*,
          g.id      AS geo_id_resolved,
          g.lat     AS geo_lat,
          g.lng     AS geo_lng,
          g.city    AS geo_city,
          g.country AS geo_country
        FROM providers p
        LEFT JOIN geopoints g ON p.geo_id = g.id
        ${whereSql}
        GROUP BY p.id, g.id, g.lat, g.lng, g.city, g.country
        ${orderBySql}
        LIMIT ${limit} OFFSET ${offset}
      `,
      values
    );

    const providerIds = providersResult.rows.map((row) => row.id);
    const providers: Provider[] = providersResult.rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      url: row.url,
      website_url: row.website_url,
      description: row.description,
      image_url: row.image_url ?? undefined,
      contact_number: row.contact_number ?? undefined,
      address: row.address ?? undefined,
      map_image_url: row.map_image_url ?? undefined,
      geo_id: row.geo_id,
      lat: row.lat,
      lng: row.lng,
      rating: Number(row.rating ?? 0),
      status: row.status,
      is_applicable: row.is_applicable,
      created_at: row.created_at,
      updated_at: row.updated_at,
      geo: row.geo_id_resolved
        ? {
            id: row.geo_id_resolved,
            lat: Number(row.geo_lat),
            lng: Number(row.geo_lng),
            city: row.geo_city ?? undefined,
            country: row.geo_country ?? undefined,
          }
        : undefined,
    }));

    // Fetch related functions & problems for returned providers
    let functionsByProvider = new Map<number, ProviderFunction[]>();
    let problemsByProvider = new Map<number, ProviderProblem[]>();

    if (providerIds.length > 0) {
      const funcResult = await client.query(
        `
          SELECT pf.provider_id, f.*
          FROM provider_functions pf
          JOIN functions f ON f.id = pf.function_id
          WHERE pf.provider_id = ANY($1::bigint[])
          ORDER BY f.name ASC
        `,
        [providerIds]
      );

      funcResult.rows.forEach((row) => {
        const list =
          functionsByProvider.get(row.provider_id) ?? ([] as ProviderFunction[]);
        list.push({
          id: row.id,
          name: row.name,
          description: row.description,
          category: row.category,
          created_at: row.created_at,
          updated_at: row.updated_at,
        });
        functionsByProvider.set(row.provider_id, list);
      });

      const probResult = await client.query(
        `
          SELECT pp.provider_id, pr.*
          FROM provider_problems pp
          JOIN problems pr ON pr.id = pp.problem_id
          WHERE pp.provider_id = ANY($1::bigint[])
          ORDER BY pr.name ASC
        `,
        [providerIds]
      );

      probResult.rows.forEach((row) => {
        const list =
          problemsByProvider.get(row.provider_id) ?? ([] as ProviderProblem[]);
        list.push({
          id: row.id,
          name: row.name,
          description: row.description,
          category: row.category,
          created_at: row.created_at,
          updated_at: row.updated_at,
        });
        problemsByProvider.set(row.provider_id, list);
      });
    }

    const providersWithRelations: Provider[] = providers.map((p) => ({
      ...p,
      functions: functionsByProvider.get(p.id),
      problems: problemsByProvider.get(p.id),
    }));

    return {
      providers: providersWithRelations,
      total,
      page,
      limit,
      totalPages,
    };
  } finally {
    client.release();
  }
}

export interface ProviderRating {
  id: number;
  provider_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface ProviderRatingSummary {
  averageRating: number;
  ratingCount: number;
  ratings: ProviderRating[];
}

export async function upsertProviderRating(
  providerId: number,
  userId: number,
  rating: number,
  comment?: string
): Promise<ProviderRatingSummary> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `
        INSERT INTO provider_ratings (provider_id, user_id, rating, comment)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (provider_id, user_id)
        DO UPDATE SET
          rating = EXCLUDED.rating,
          comment = EXCLUDED.comment,
          created_at = CURRENT_TIMESTAMP
      `,
      [providerId, userId, rating, comment ?? null]
    );

    // Recalculate average rating and update providers table
    const summaryResult = await client.query(
      `
        SELECT
          AVG(rating)::numeric(3,2) AS average_rating,
          COUNT(*)::int           AS rating_count
        FROM provider_ratings
        WHERE provider_id = $1
      `,
      [providerId]
    );

    const { average_rating, rating_count } = summaryResult.rows[0];
    const avg = Number(average_rating ?? 0);

    await client.query(
      `
        UPDATE providers
        SET rating = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
      [providerId, avg]
    );

    const ratingsResult = await client.query(
      `
        SELECT id, provider_id, user_id, rating, comment, created_at
        FROM provider_ratings
        WHERE provider_id = $1
        ORDER BY created_at DESC
      `,
      [providerId]
    );

    await client.query("COMMIT");

    return {
      averageRating: avg,
      ratingCount: Number(rating_count ?? 0),
      ratings: ratingsResult.rows.map((row) => ({
        id: row.id,
        provider_id: row.provider_id,
        user_id: row.user_id,
        rating: Number(row.rating),
        comment: row.comment ?? undefined,
        created_at: row.created_at,
      })),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getProviderRatingSummary(
  providerId: number
): Promise<ProviderRatingSummary> {
  const client = await pool.connect();

  try {
    const summaryResult = await client.query(
      `
        SELECT
          AVG(rating)::numeric(3,2) AS average_rating,
          COUNT(*)::int           AS rating_count
        FROM provider_ratings
        WHERE provider_id = $1
      `,
      [providerId]
    );

    const { average_rating, rating_count } = summaryResult.rows[0] ?? {
      average_rating: 0,
      rating_count: 0,
    };
    const avg = Number(average_rating ?? 0);

    const ratingsResult = await client.query(
      `
        SELECT id, provider_id, user_id, rating, comment, created_at
        FROM provider_ratings
        WHERE provider_id = $1
        ORDER BY created_at DESC
      `,
      [providerId]
    );

    return {
      averageRating: avg,
      ratingCount: Number(rating_count ?? 0),
      ratings: ratingsResult.rows.map((row) => ({
        id: row.id,
        provider_id: row.provider_id,
        user_id: row.user_id,
        rating: Number(row.rating),
        comment: row.comment ?? undefined,
        created_at: row.created_at,
      })),
    };
  } finally {
    client.release();
  }
}

// ============================================
// CREATE PROVIDER
// ============================================

export async function createProvider(input: ProviderCreateInput): Promise<ProviderWithRelations> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Validate required field
    if (!input.name || input.name.trim().length === 0) {
      throw new Error("Provider name is required");
    }

    const status = input.status ?? "active";
    const isApplicable = input.is_applicable ?? true;
    const locationBy = input.location_by ?? false;

    // Create provider record
    const providerResult = await client.query(
      `
        INSERT INTO providers (
          user_id, name, url, website_url, description, image_url,
          contact_number, address, map_image_url,
          geo_id, lat, lng, near_city,
          status, is_applicable, location_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id, user_id, name, url, website_url, description, image_url,
                  contact_number, address, map_image_url,
                  geo_id, lat, lng, near_city, rating, status, is_applicable,
                  location_by, created_at, updated_at
      `,
      [
        input.user_id ?? null,
        input.name.trim(),
        input.url ?? null,
        input.website_url ?? null,
        input.description ?? null,
        input.image_url ?? null,
        input.contact_number ?? null,
        input.address ?? null,
        input.map_image_url ?? null,
        input.geo_id ?? null,
        input.lat ?? null,
        input.lng ?? null,
        input.near_city ?? null,
        status,
        isApplicable,
        locationBy,
      ]
    );

    const providerRow = providerResult.rows[0];
    const providerId = providerRow.id;

    // Link functions
    if (input.function_ids && input.function_ids.length > 0) {
      for (const funcId of input.function_ids) {
        await client.query(
          `INSERT INTO provider_functions (provider_id, function_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [providerId, funcId]
        );
      }
    }

    // Link problems
    if (input.problem_ids && input.problem_ids.length > 0) {
      for (const probId of input.problem_ids) {
        await client.query(
          `INSERT INTO provider_problems (provider_id, problem_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [providerId, probId]
        );
      }
    }

    await client.query("COMMIT");

    // Return full provider with relations
    return (await getProviderById(providerId))!;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// ============================================
// UPDATE PROVIDER
// ============================================

export async function updateProvider(
  id: number,
  input: ProviderUpdateInput
): Promise<ProviderWithRelations | null> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if provider exists
    const providerCheck = await client.query(`SELECT id FROM providers WHERE id = $1`, [id]);
    if (providerCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    // Build update query dynamically
    const updates: string[] = [];
    const updateValues: any[] = [id];
    let paramIndex = 2;

    if (input.name !== undefined) {
      if (!input.name || input.name.trim().length === 0) {
        throw new Error("Provider name cannot be empty");
      }
      updates.push(`name = $${paramIndex++}`);
      updateValues.push(input.name.trim());
    }
    if (input.user_id !== undefined) {
      updates.push(`user_id = $${paramIndex++}`);
      updateValues.push(input.user_id ?? null);
    }
    if (input.url !== undefined) {
      updates.push(`url = $${paramIndex++}`);
      updateValues.push(input.url ?? null);
    }
    if (input.website_url !== undefined) {
      updates.push(`website_url = $${paramIndex++}`);
      updateValues.push(input.website_url ?? null);
    }
    if (input.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      updateValues.push(input.description ?? null);
    }
    if (input.image_url !== undefined) {
      updates.push(`image_url = $${paramIndex++}`);
      updateValues.push(input.image_url ?? null);
    }
    if (input.contact_number !== undefined) {
      updates.push(`contact_number = $${paramIndex++}`);
      updateValues.push(input.contact_number ?? null);
    }
    if (input.address !== undefined) {
      updates.push(`address = $${paramIndex++}`);
      updateValues.push(input.address ?? null);
    }
    if (input.map_image_url !== undefined) {
      updates.push(`map_image_url = $${paramIndex++}`);
      updateValues.push(input.map_image_url ?? null);
    }
    if (input.geo_id !== undefined) {
      updates.push(`geo_id = $${paramIndex++}`);
      updateValues.push(input.geo_id ?? null);
    }
    if (input.lat !== undefined) {
      updates.push(`lat = $${paramIndex++}`);
      updateValues.push(input.lat ?? null);
    }
    if (input.lng !== undefined) {
      updates.push(`lng = $${paramIndex++}`);
      updateValues.push(input.lng ?? null);
    }
    if (input.near_city !== undefined) {
      updates.push(`near_city = $${paramIndex++}`);
      updateValues.push(input.near_city ?? null);
    }
    if (input.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      updateValues.push(input.status);
    }
    if (input.is_applicable !== undefined) {
      updates.push(`is_applicable = $${paramIndex++}`);
      updateValues.push(input.is_applicable);
    }
    if (input.location_by !== undefined) {
      updates.push(`location_by = $${paramIndex++}`);
      updateValues.push(input.location_by);
    }

    if (updates.length > 0) {
      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      await client.query(`UPDATE providers SET ${updates.join(", ")} WHERE id = $1`, updateValues);
    }

    // Update function links (replace all)
    if (input.function_ids !== undefined) {
      await client.query(`DELETE FROM provider_functions WHERE provider_id = $1`, [id]);
      if (input.function_ids.length > 0) {
        for (const funcId of input.function_ids) {
          await client.query(
            `INSERT INTO provider_functions (provider_id, function_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [id, funcId]
          );
        }
      }
    }

    // Update problem links (replace all)
    if (input.problem_ids !== undefined) {
      await client.query(`DELETE FROM provider_problems WHERE provider_id = $1`, [id]);
      if (input.problem_ids.length > 0) {
        for (const probId of input.problem_ids) {
          await client.query(
            `INSERT INTO provider_problems (provider_id, problem_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [id, probId]
          );
        }
      }
    }

    await client.query("COMMIT");

    return await getProviderById(id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// ============================================
// DELETE PROVIDER
// ============================================

export async function deleteProvider(id: number): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if provider exists
    const providerResult = await client.query(`SELECT id FROM providers WHERE id = $1`, [id]);
    if (providerResult.rows.length === 0) {
      await client.query("ROLLBACK");
      throw new Error("Provider not found");
    }

    // Delete provider (cascades to provider_functions, provider_problems, provider_ratings)
    // Note: user_id is optional, so we don't delete user
    await client.query(`DELETE FROM providers WHERE id = $1`, [id]);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}


