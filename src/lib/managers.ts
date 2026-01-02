import pool from "@/lib/database";
import { createOrUpdateProfile, hashPassword } from "@/lib/auth";
import type {
  Manager,
  ManagerSearchParams,
  ManagerSearchResponse,
  ManagerCreateInput,
  ManagerUpdateInput,
  ManagerAggregations,
  ManagerFunction,
  ManagerProblem,
} from "@/types/manager";

// ============================================
// HELPER FUNCTIONS
// ============================================

const toNumber = (value: any, defaultValue: number): number => {
  const n = parseInt(String(value), 10);
  return Number.isNaN(n) ? defaultValue : n;
};

const toBoolean = (value: any): boolean | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (value === true || value === 'true' || value === '1') return true;
  if (value === false || value === 'false' || value === '0') return false;
  return undefined;
};

// Haversine formula to calculate distance between two points
const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// ============================================
// GET MANAGER BY ID
// ============================================

export async function getManagerById(id: number): Promise<Manager | null> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
        SELECT
          m.id,
          m.user_id,
          m.name,
          m.description,
          m.expertise,
          m.image_id,
          m.lat,
          m.lng,
          m.rating,
          m.rating_count,
          m.status,
          m.is_given_set,
          m.created_at,
          u.email,
          u.role,
          p.first_name,
          p.last_name,
          p.title,
          p.function,
          p.location,
          p.geo_id,
          p.avatar_id,
          p.pen_name,
          g.city,
          g.country,
          fa_avatar.url as avatar_url,
          fa_image.url as image_url
        FROM managers m
        INNER JOIN users u ON u.id = m.user_id
        LEFT JOIN profiles p ON p.user_id = u.id
        LEFT JOIN geopoints g ON g.id = m.geo_id
        LEFT JOIN file_assets fa_avatar ON fa_avatar.id = p.avatar_id
        LEFT JOIN file_assets fa_image ON fa_image.id = m.image_id
        WHERE m.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    
    // Get functions
    const functionsResult = await client.query(
      `
        SELECT f.id, f.name, f.description, f.category
        FROM functions f
        INNER JOIN manager_functions mf ON mf.function_id = f.id
        WHERE mf.manager_id = $1
      `,
      [id]
    );

    // Get problems
    const problemsResult = await client.query(
      `
        SELECT pr.id, pr.name, pr.description, pr.category
        FROM problems pr
        INNER JOIN manager_problems mp ON mp.problem_id = pr.id
        WHERE mp.manager_id = $1
      `,
      [id]
    );

    const manager: Manager = {
      id: row.id,
      user_id: row.user_id,
      email: row.email,
      role: "manager",
      status: row.status,
      created_at: row.created_at,
      name: row.name,
      description: row.description ?? undefined,
      expertise: row.expertise ?? undefined,
      rating: parseFloat(row.rating) || 0,
      rating_count: row.rating_count || 0,
      is_given_set: row.is_given_set || false,
      image_id: row.image_id ?? undefined,
      image_url: row.image_url ?? undefined,
      lat: row.lat ? parseFloat(row.lat) : undefined,
      lng: row.lng ? parseFloat(row.lng) : undefined,
      geo_id: row.geo_id ?? undefined,
      city: row.city ?? undefined,
      country: row.country ?? undefined,
      first_name: row.first_name ?? undefined,
      last_name: row.last_name ?? undefined,
      title: row.title ?? undefined,
      function: row.function ?? undefined,
      location: row.location ?? undefined,
      avatar_id: row.avatar_id ?? undefined,
      avatar_url: row.avatar_url ?? undefined,
      pen_name: row.pen_name ?? undefined,
      functions: functionsResult.rows as ManagerFunction[],
      problems: problemsResult.rows as ManagerProblem[],
    };

    return manager;
  } finally {
    client.release();
  }
}

// ============================================
// SEARCH MANAGERS - Advanced Search
// ============================================

export async function searchManagers(
  params: ManagerSearchParams
): Promise<ManagerSearchResponse> {
  const {
    q,
    managers: managersSearch,
    problems: problemsSearch,
    functions: functionsSearch,
    expertise: expertiseSearch,
    descriptions: descriptionsSearch,
    operation = 'or',
    rating,
    rating_min,
    rating_max,
    given_set,
    near_city,
    city_id,
    lat,
    lng,
    radius = 50,
    starts_with,
    page: rawPage,
    limit: rawLimit,
    sort_by = 'created_at',
    sort_order = 'desc',
    status,
    include_functions,
    include_problems,
  } = params;

  const page = Math.max(toNumber(rawPage, 1), 1);
  const limit = Math.min(Math.max(toNumber(rawLimit, 20), 1), 100);
  const offset = (page - 1) * limit;

  const values: any[] = [];
  const where: string[] = [];
  const joins: string[] = [];
  let needsFunctionJoin = false;
  let needsProblemJoin = false;

  // ========== Build WHERE conditions ==========

  // Status filter
  if (status) {
    values.push(status);
    where.push(`m.status = $${values.length}`);
  }

  // Given Set filter
  const givenSetBool = toBoolean(given_set);
  if (givenSetBool !== undefined) {
    where.push(`m.is_given_set = ${givenSetBool}`);
  }

  // Alphabet filter (starts_with)
  if (starts_with && starts_with.length === 1) {
    values.push(starts_with.toUpperCase() + '%');
    where.push(`UPPER(m.name) LIKE $${values.length}`);
  }

  // Rating filters
  if (rating) {
    switch (rating) {
      case '5':
        where.push(`m.rating >= 4.5`);
        break;
      case '4':
        where.push(`m.rating >= 3.5 AND m.rating < 4.5`);
        break;
      case '3':
        where.push(`m.rating >= 2.5 AND m.rating < 3.5`);
        break;
      case 'below2':
        where.push(`m.rating < 2.5`);
        break;
    }
  } else {
    if (rating_min !== undefined) {
      values.push(rating_min);
      where.push(`m.rating >= $${values.length}`);
    }
    if (rating_max !== undefined) {
      values.push(rating_max);
      where.push(`m.rating <= $${values.length}`);
    }
  }

  // ========== Text Search Conditions ==========
  const searchConditions: string[] = [];

  // General search (q)
  if (q && q.trim().length > 0) {
    const term = operation === 'exact' ? q.trim() : `%${q.trim()}%`;
    values.push(term);
    const idx = values.length;
    
    if (operation === 'exact') {
      searchConditions.push(`(
        m.name = $${idx}
        OR m.description = $${idx}
        OR m.expertise = $${idx}
        OR u.email = $${idx}
        OR COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '') = $${idx}
      )`);
    } else {
      searchConditions.push(`(
        m.name ILIKE $${idx}
        OR m.description ILIKE $${idx}
        OR m.expertise ILIKE $${idx}
        OR u.email ILIKE $${idx}
        OR COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '') ILIKE $${idx}
      )`);
    }
  }

  // Manager name search
  if (managersSearch && managersSearch.trim().length > 0) {
    const term = operation === 'exact' ? managersSearch.trim() : `%${managersSearch.trim()}%`;
    values.push(term);
    const idx = values.length;
    
    if (operation === 'exact') {
      searchConditions.push(`m.name = $${idx}`);
    } else {
      searchConditions.push(`m.name ILIKE $${idx}`);
    }
  }

  // Description search
  if (descriptionsSearch && descriptionsSearch.trim().length > 0) {
    const term = operation === 'exact' ? descriptionsSearch.trim() : `%${descriptionsSearch.trim()}%`;
    values.push(term);
    const idx = values.length;
    
    if (operation === 'exact') {
      searchConditions.push(`m.description = $${idx}`);
    } else {
      searchConditions.push(`m.description ILIKE $${idx}`);
    }
  }

  // Expertise search
  if (expertiseSearch && expertiseSearch.trim().length > 0) {
    const term = operation === 'exact' ? expertiseSearch.trim() : `%${expertiseSearch.trim()}%`;
    values.push(term);
    const idx = values.length;
    
    if (operation === 'exact') {
      searchConditions.push(`m.expertise = $${idx}`);
    } else {
      searchConditions.push(`m.expertise ILIKE $${idx}`);
    }
  }

  // Functions search (requires join)
  if (functionsSearch && functionsSearch.trim().length > 0) {
    needsFunctionJoin = true;
    const term = operation === 'exact' ? functionsSearch.trim() : `%${functionsSearch.trim()}%`;
    values.push(term);
    const idx = values.length;
    
    if (operation === 'exact') {
      searchConditions.push(`f.name = $${idx}`);
    } else {
      searchConditions.push(`f.name ILIKE $${idx}`);
    }
  }

  // Problems search (requires join)
  if (problemsSearch && problemsSearch.trim().length > 0) {
    needsProblemJoin = true;
    const term = operation === 'exact' ? problemsSearch.trim() : `%${problemsSearch.trim()}%`;
    values.push(term);
    const idx = values.length;
    
    if (operation === 'exact') {
      searchConditions.push(`pr.name = $${idx}`);
    } else {
      searchConditions.push(`pr.name ILIKE $${idx}`);
    }
  }

  // Combine search conditions based on operation
  if (searchConditions.length > 0) {
    const combiner = operation === 'and' ? ' AND ' : ' OR ';
    where.push(`(${searchConditions.join(combiner)})`);
  }

  // Add required joins
  if (needsFunctionJoin) {
    joins.push(`LEFT JOIN manager_functions mf ON mf.manager_id = m.id`);
    joins.push(`LEFT JOIN functions f ON f.id = mf.function_id`);
  }
  if (needsProblemJoin) {
    joins.push(`LEFT JOIN manager_problems mp ON mp.manager_id = m.id`);
    joins.push(`LEFT JOIN problems pr ON pr.id = mp.problem_id`);
  }

  // ========== Location Search ==========
  let locationLat: number | null = null;
  let locationLng: number | null = null;

  if (lat !== undefined && lng !== undefined) {
    locationLat = lat;
    locationLng = lng;
  } else if (near_city || city_id) {
    // Get city coordinates
    const client = await pool.connect();
    try {
      let cityResult;
      if (city_id) {
        cityResult = await client.query(
          `SELECT lat, lng FROM cities_metadata WHERE id = $1`,
          [city_id]
        );
      } else if (near_city) {
        cityResult = await client.query(
          `SELECT lat, lng FROM cities_metadata WHERE name ILIKE $1 LIMIT 1`,
          [`%${near_city}%`]
        );
      }
      if (cityResult && cityResult.rows.length > 0) {
        locationLat = parseFloat(cityResult.rows[0].lat);
        locationLng = parseFloat(cityResult.rows[0].lng);
      }
    } finally {
      client.release();
    }
  }

  // Build the query
  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const joinsSql = joins.join("\n");

  // Determine sort column
  let orderBy = 'm.created_at';
  switch (sort_by) {
    case 'name':
      orderBy = 'm.name';
      break;
    case 'rating':
      orderBy = 'm.rating';
      break;
    case 'distance':
      if (locationLat !== null && locationLng !== null) {
        orderBy = 'distance_km';
      }
      break;
    case 'created_at':
    default:
      orderBy = 'm.created_at';
  }

  const client = await pool.connect();

  try {
    // Build distance calculation if location search
    let distanceSelect = '';
    let distanceOrderBy = '';
    
    if (locationLat !== null && locationLng !== null) {
      // Using Haversine formula in SQL
      distanceSelect = `,
        (6371 * acos(
          cos(radians(${locationLat})) * cos(radians(m.lat)) *
          cos(radians(m.lng) - radians(${locationLng})) +
          sin(radians(${locationLat})) * sin(radians(m.lat))
        )) as distance_km`;
      
      // Add distance filter
      const distanceFilter = `
        m.lat IS NOT NULL AND m.lng IS NOT NULL AND
        (6371 * acos(
          cos(radians(${locationLat})) * cos(radians(m.lat)) *
          cos(radians(m.lng) - radians(${locationLng})) +
          sin(radians(${locationLat})) * sin(radians(m.lat))
        )) <= ${radius}`;
      
      if (where.length > 0) {
        where.push(distanceFilter);
      } else {
        where.push(distanceFilter);
      }

      if (sort_by === 'distance') {
        distanceOrderBy = 'distance_km';
      }
    }

    // Rebuild whereSql with distance filter
    const finalWhereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    // Count query
    const countResult = await client.query(
      `
        SELECT COUNT(DISTINCT m.id) AS total
        FROM managers m
        INNER JOIN users u ON u.id = m.user_id
        LEFT JOIN profiles p ON p.user_id = u.id
        LEFT JOIN geopoints g ON g.id = m.geo_id
        ${joinsSql}
        ${finalWhereSql}
      `,
      values
    );

    const total = Number(countResult.rows[0]?.total ?? 0);
    const totalPages = Math.ceil(total / limit) || 1;

    // Data query
    const finalOrderBy = distanceOrderBy || orderBy;
    const dataResult = await client.query(
      `
        SELECT DISTINCT
          m.id,
          m.user_id,
          m.name,
          m.description,
          m.expertise,
          m.image_id,
          m.lat,
          m.lng,
          m.rating,
          m.rating_count,
          m.status,
          m.is_given_set,
          m.created_at,
          u.email,
          u.role,
          p.first_name,
          p.last_name,
          p.title,
          p.function,
          p.location,
          p.geo_id,
          p.avatar_id,
          p.pen_name,
          g.city,
          g.country,
          fa_avatar.url as avatar_url,
          fa_image.url as image_url
          ${distanceSelect}
        FROM managers m
        INNER JOIN users u ON u.id = m.user_id
        LEFT JOIN profiles p ON p.user_id = u.id
        LEFT JOIN geopoints g ON g.id = m.geo_id
        LEFT JOIN file_assets fa_avatar ON fa_avatar.id = p.avatar_id
        LEFT JOIN file_assets fa_image ON fa_image.id = m.image_id
        ${joinsSql}
        ${finalWhereSql}
        ORDER BY ${finalOrderBy} ${sort_order.toUpperCase()}
        LIMIT ${limit} OFFSET ${offset}
      `,
      values
    );

    // Map results
    const managers: Manager[] = await Promise.all(
      dataResult.rows.map(async (row) => {
        const manager: Manager = {
          id: row.id,
          user_id: row.user_id,
          email: row.email,
          role: "manager",
          status: row.status,
          created_at: row.created_at,
          name: row.name,
          description: row.description ?? undefined,
          expertise: row.expertise ?? undefined,
          rating: parseFloat(row.rating) || 0,
          rating_count: row.rating_count || 0,
          is_given_set: row.is_given_set || false,
          image_id: row.image_id ?? undefined,
          image_url: row.image_url ?? undefined,
          lat: row.lat ? parseFloat(row.lat) : undefined,
          lng: row.lng ? parseFloat(row.lng) : undefined,
          geo_id: row.geo_id ?? undefined,
          city: row.city ?? undefined,
          country: row.country ?? undefined,
          first_name: row.first_name ?? undefined,
          last_name: row.last_name ?? undefined,
          title: row.title ?? undefined,
          function: row.function ?? undefined,
          location: row.location ?? undefined,
          avatar_id: row.avatar_id ?? undefined,
          avatar_url: row.avatar_url ?? undefined,
          pen_name: row.pen_name ?? undefined,
          distance_km: row.distance_km ? parseFloat(row.distance_km) : undefined,
        };

        // Include functions if requested
        if (include_functions) {
          const funcResult = await client.query(
            `SELECT f.id, f.name, f.description, f.category
             FROM functions f
             INNER JOIN manager_functions mf ON mf.function_id = f.id
             WHERE mf.manager_id = $1`,
            [row.id]
          );
          manager.functions = funcResult.rows;
        }

        // Include problems if requested
        if (include_problems) {
          const probResult = await client.query(
            `SELECT pr.id, pr.name, pr.description, pr.category
             FROM problems pr
             INNER JOIN manager_problems mp ON mp.problem_id = pr.id
             WHERE mp.manager_id = $1`,
            [row.id]
          );
          manager.problems = probResult.rows;
        }

        return manager;
      })
    );

    // Get aggregations
    const aggregations = await getManagerAggregations(client);

    return {
      managers,
      total,
      page,
      limit,
      totalPages,
      filters: params,
      aggregations,
    };
  } finally {
    client.release();
  }
}

// ============================================
// GET AGGREGATIONS
// ============================================

async function getManagerAggregations(client: any): Promise<ManagerAggregations> {
  // Total managers
  const totalResult = await client.query(`SELECT COUNT(*) as count FROM managers`);
  const total_managers = parseInt(totalResult.rows[0].count);

  // With problems
  const problemsResult = await client.query(`
    SELECT COUNT(DISTINCT m.id) as count 
    FROM managers m 
    INNER JOIN manager_problems mp ON mp.manager_id = m.id
  `);
  const total_with_problems = parseInt(problemsResult.rows[0].count);

  // With functions
  const functionsResult = await client.query(`
    SELECT COUNT(DISTINCT m.id) as count 
    FROM managers m 
    INNER JOIN manager_functions mf ON mf.manager_id = m.id
  `);
  const total_with_functions = parseInt(functionsResult.rows[0].count);

  // With expertise
  const expertiseResult = await client.query(`
    SELECT COUNT(*) as count FROM managers WHERE expertise IS NOT NULL AND expertise != ''
  `);
  const total_with_expertise = parseInt(expertiseResult.rows[0].count);

  // With descriptions
  const descriptionsResult = await client.query(`
    SELECT COUNT(*) as count FROM managers WHERE description IS NOT NULL AND description != ''
  `);
  const total_with_descriptions = parseInt(descriptionsResult.rows[0].count);

  // By rating
  const rating5Result = await client.query(`SELECT COUNT(*) as count FROM managers WHERE rating >= 4.5`);
  const rating4Result = await client.query(`SELECT COUNT(*) as count FROM managers WHERE rating >= 3.5 AND rating < 4.5`);
  const rating3Result = await client.query(`SELECT COUNT(*) as count FROM managers WHERE rating >= 2.5 AND rating < 3.5`);
  const ratingBelow2Result = await client.query(`SELECT COUNT(*) as count FROM managers WHERE rating < 2.5`);

  // Given set
  const givenSetResult = await client.query(`SELECT COUNT(*) as count FROM managers WHERE is_given_set = true`);
  const total_in_given_set = parseInt(givenSetResult.rows[0].count);

  // By alphabet
  const alphabetResult = await client.query(`
    SELECT UPPER(LEFT(name, 1)) as letter, COUNT(*) as count 
    FROM managers 
    GROUP BY UPPER(LEFT(name, 1))
    ORDER BY letter
  `);
  const by_alphabet: Record<string, number> = {};
  alphabetResult.rows.forEach((row: any) => {
    by_alphabet[row.letter] = parseInt(row.count);
  });

  return {
    total_managers,
    total_with_problems,
    total_with_functions,
    total_with_expertise,
    total_with_descriptions,
    by_rating: {
      '5': parseInt(rating5Result.rows[0].count),
      '4': parseInt(rating4Result.rows[0].count),
      '3': parseInt(rating3Result.rows[0].count),
      'below2': parseInt(ratingBelow2Result.rows[0].count),
    },
    total_in_given_set,
    by_alphabet,
  };
}

// ============================================
// CREATE MANAGER
// ============================================

export async function createManager(
  input: ManagerCreateInput
): Promise<Manager> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const passwordHash = await hashPassword(input.password);
    const status = input.status ?? "active";

    // Create user with role 'manager'
    const userResult = await client.query(
      `
        INSERT INTO users (email, password_hash, role, status)
        VALUES ($1, $2, 'manager', $3)
        RETURNING id, email, role, status, created_at
      `,
      [input.email.toLowerCase(), passwordHash, status]
    );

    const userRow = userResult.rows[0];

    // Create profile if provided
    if (input.profile) {
      await createOrUpdateProfile({
        user_id: userRow.id,
        ...input.profile,
      });
    }

    // Create manager record
    const managerResult = await client.query(
      `
        INSERT INTO managers (user_id, name, description, expertise, image_id, lat, lng, geo_id, status, is_given_set)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, user_id, name, description, expertise, image_id, lat, lng, geo_id, rating, rating_count, status, is_given_set, created_at
      `,
      [
        userRow.id,
        input.name,
        input.description ?? null,
        input.expertise ?? null,
        input.image_id ?? null,
        input.lat ?? null,
        input.lng ?? null,
        input.geo_id ?? null,
        status,
        input.is_given_set ?? false,
      ]
    );

    const managerRow = managerResult.rows[0];

    // Link functions
    if (input.function_ids && input.function_ids.length > 0) {
      for (const funcId of input.function_ids) {
        await client.query(
          `INSERT INTO manager_functions (manager_id, function_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [managerRow.id, funcId]
        );
      }
    }

    // Link problems
    if (input.problem_ids && input.problem_ids.length > 0) {
      for (const probId of input.problem_ids) {
        await client.query(
          `INSERT INTO manager_problems (manager_id, problem_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [managerRow.id, probId]
        );
      }
    }

    await client.query("COMMIT");

    // Return full manager
    return (await getManagerById(managerRow.id))!;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// ============================================
// UPDATE MANAGER
// ============================================

export async function updateManager(
  id: number,
  input: ManagerUpdateInput
): Promise<Manager | null> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Get manager to find user_id
    const managerCheck = await client.query(
      `SELECT user_id FROM managers WHERE id = $1`,
      [id]
    );

    if (managerCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const userId = managerCheck.rows[0].user_id;

    // Update user status if provided
    if (input.status) {
      await client.query(
        `UPDATE users SET status = $2 WHERE id = $1`,
        [userId, input.status]
      );
    }

    // Update password if provided
    if (input.password) {
      const passwordHash = await hashPassword(input.password);
      await client.query(
        `UPDATE users SET password_hash = $2 WHERE id = $1`,
        [userId, passwordHash]
      );
    }

    // Update profile if provided
    if (input.profile) {
      await createOrUpdateProfile({
        user_id: userId,
        ...input.profile,
      });
    }

    // Update manager record
    const updates: string[] = [];
    const updateValues: any[] = [id];
    let paramIndex = 2;

    if (input.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      updateValues.push(input.name);
    }
    if (input.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      updateValues.push(input.description);
    }
    if (input.expertise !== undefined) {
      updates.push(`expertise = $${paramIndex++}`);
      updateValues.push(input.expertise);
    }
    if (input.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      updateValues.push(input.status);
    }
    if (input.is_given_set !== undefined) {
      updates.push(`is_given_set = $${paramIndex++}`);
      updateValues.push(input.is_given_set);
    }
    if (input.image_id !== undefined) {
      updates.push(`image_id = $${paramIndex++}`);
      updateValues.push(input.image_id);
    }
    if (input.lat !== undefined) {
      updates.push(`lat = $${paramIndex++}`);
      updateValues.push(input.lat);
    }
    if (input.lng !== undefined) {
      updates.push(`lng = $${paramIndex++}`);
      updateValues.push(input.lng);
    }
    if (input.geo_id !== undefined) {
      updates.push(`geo_id = $${paramIndex++}`);
      updateValues.push(input.geo_id);
    }

    if (updates.length > 0) {
      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      await client.query(
        `UPDATE managers SET ${updates.join(', ')} WHERE id = $1`,
        updateValues
      );
    }

    // Update function links
    if (input.function_ids !== undefined) {
      await client.query(`DELETE FROM manager_functions WHERE manager_id = $1`, [id]);
      for (const funcId of input.function_ids) {
        await client.query(
          `INSERT INTO manager_functions (manager_id, function_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [id, funcId]
        );
      }
    }

    // Update problem links
    if (input.problem_ids !== undefined) {
      await client.query(`DELETE FROM manager_problems WHERE manager_id = $1`, [id]);
      for (const probId of input.problem_ids) {
        await client.query(
          `INSERT INTO manager_problems (manager_id, problem_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [id, probId]
        );
      }
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

// ============================================
// DELETE MANAGER
// ============================================

export async function deleteManager(id: number): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Get user_id first
    const managerResult = await client.query(
      `SELECT user_id FROM managers WHERE id = $1`,
      [id]
    );

    if (managerResult.rows.length > 0) {
      const userId = managerResult.rows[0].user_id;

      // Delete manager (cascades to manager_functions, manager_problems, manager_ratings)
      await client.query(`DELETE FROM managers WHERE id = $1`, [id]);

      // Delete user (cascades to profiles, etc.)
      await client.query(`DELETE FROM users WHERE id = $1`, [userId]);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// ============================================
// RATE MANAGER
// ============================================

export async function rateManager(
  managerId: number,
  userId: number,
  rating: number,
  comment?: string
): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Insert or update rating
    await client.query(
      `
        INSERT INTO manager_ratings (manager_id, user_id, rating, comment)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (manager_id, user_id) 
        DO UPDATE SET rating = $3, comment = $4, created_at = CURRENT_TIMESTAMP
      `,
      [managerId, userId, rating, comment ?? null]
    );

    // Update manager's average rating
    const avgResult = await client.query(
      `
        SELECT AVG(rating)::DECIMAL(3,2) as avg_rating, COUNT(*) as count
        FROM manager_ratings
        WHERE manager_id = $1
      `,
      [managerId]
    );

    await client.query(
      `UPDATE managers SET rating = $2, rating_count = $3 WHERE id = $1`,
      [managerId, avgResult.rows[0].avg_rating, avgResult.rows[0].count]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
