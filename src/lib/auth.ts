import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';
import pool from './database';

export interface User {
  id: number;
  email: string;
  role: string;
  status: string;
  created_at: Date;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

export interface UserProfile {
  user_id: number;
  first_name?: string;
  last_name?: string;
  title?: string;
  function?: string;
  geo_id?: number;
  avatar_id?: number;
  pen_name?: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key';

// Password hashing utilities
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// JWT utilities
export const generateTokens = (user: User) => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): { userId: number } | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: number };
  } catch (error) {
    return null;
  }
};

// Database user operations
export const createUser = async (email: string, password: string): Promise<User> => {
  const client = await pool.connect();
  
  try {
    const hashedPassword = await hashPassword(password);
    
    const result = await client.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, role, status, created_at',
      [email, hashedPassword]
    );
    
    return result.rows[0];
  } finally {
    client.release();
  }
};

export const findUserByEmail = async (email: string): Promise<UserWithPassword | null> => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT id, email, password_hash, role, status, created_at FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows[0] || null;
  } finally {
    client.release();
  }
};

export const findUserById = async (id: number): Promise<User | null> => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT id, email, role, status, created_at FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
  } finally {
    client.release();
  }
};

export const updateUserStatus = async (id: number, status: string): Promise<void> => {
  const client = await pool.connect();
  
  try {
    await client.query(
      'UPDATE users SET status = $1 WHERE id = $2',
      [status, id]
    );
  } finally {
    client.release();
  }
};

export const updateUserRole = async (id: number, role: string): Promise<void> => {
  const client = await pool.connect();
  
  try {
    await client.query(
      'UPDATE users SET role = $1 WHERE id = $2',
      [role, id]
    );
  } finally {
    client.release();
  }
};

export const updateUserPassword = async (id: number, newPassword: string): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const hashedPassword = await hashPassword(newPassword);
    await client.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, id]
    );
  } finally {
    client.release();
  }
};

// Profile operations
export const getUserProfile = async (userId: number): Promise<UserProfile | null> => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT * FROM profiles WHERE user_id = $1',
      [userId]
    );
    
    return result.rows[0] || null;
  } finally {
    client.release();
  }
};

export const createOrUpdateProfile = async (profile: UserProfile): Promise<UserProfile> => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      INSERT INTO profiles (user_id, first_name, last_name, title, function, geo_id, avatar_id, pen_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        first_name = $2,
        last_name = $3,
        title = $4,
        function = $5,
        geo_id = $6,
        avatar_id = $7,
        pen_name = $8
      RETURNING *
    `, [
      profile.user_id,
      profile.first_name,
      profile.last_name,
      profile.title,
      profile.function,
      profile.geo_id,
      profile.avatar_id,
      profile.pen_name
    ]);
    
    return result.rows[0];
  } finally {
    client.release();
  }
};

// Social login support
export const findOrCreateUserFromSocialLogin = async (
  email: string,
  firstName?: string,
  lastName?: string
): Promise<{ user: User; profile: UserProfile | null }> => {
  const normalizedEmail = email.toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);

  let user: User;

  if (!existingUser) {
    const client = await pool.connect();

    try {
      const placeholderPassword = await hashPassword(generateRandomToken());
      const result = await client.query(
        `INSERT INTO users (email, password_hash, role, status)
         VALUES ($1, $2, 'user', 'active')
         RETURNING id, email, role, status, created_at`,
        [normalizedEmail, placeholderPassword]
      );

      user = result.rows[0];
    } finally {
      client.release();
    }
  } else {
    user = {
      id: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
      status: existingUser.status,
      created_at: existingUser.created_at,
    };

    if (user.status !== 'active') {
      const client = await pool.connect();

      try {
        const result = await client.query(
          `UPDATE users
           SET status = 'active'
           WHERE id = $1
           RETURNING id, email, role, status, created_at`,
          [user.id]
        );

        user = result.rows[0];
      } finally {
        client.release();
      }
    }
  }

  let profile = await getUserProfile(user.id);

  if (firstName || lastName) {
    const profileToPersist: UserProfile = {
      user_id: user.id,
      first_name: firstName ?? profile?.first_name,
      last_name: lastName ?? profile?.last_name,
      title: profile?.title,
      function: profile?.function,
      geo_id: profile?.geo_id,
      avatar_id: profile?.avatar_id,
      pen_name: profile?.pen_name,
    };

    profile = await createOrUpdateProfile(profileToPersist);
  }

  return { user, profile };
};

// Token management
export const storeRefreshToken = async (userId: number, refreshToken: string): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await client.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, refreshToken, expiresAt]
    );
  } finally {
    client.release();
  }
};

export const validateRefreshToken = async (refreshToken: string): Promise<number | null> => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT user_id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [refreshToken]
    );
    
    return result.rows[0]?.user_id || null;
  } finally {
    client.release();
  }
};

export const invalidateRefreshToken = async (refreshToken: string): Promise<void> => {
  const client = await pool.connect();
  
  try {
    await client.query(
      'DELETE FROM refresh_tokens WHERE token = $1',
      [refreshToken]
    );
  } finally {
    client.release();
  }
};

// Verification tokens
export const createVerificationToken = async (userId: number, token: string, type: string): Promise<void> => {
  const client = await pool.connect();
  
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await client.query(
      'INSERT INTO user_tokens (token, user_id, token_type, expires_at) VALUES ($1, $2, $3, $4)',
      [token, userId, type, expiresAt]
    );
  } finally {
    client.release();
  }
};

export const validateVerificationToken = async (token: string, type: string): Promise<number | null> => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT user_id FROM user_tokens WHERE token = $1 AND token_type = $2 AND expires_at > NOW()',
      [token, type]
    );
    
    if (result.rows[0]) {
      // Delete the token after successful validation
      await client.query(
        'DELETE FROM user_tokens WHERE token = $1',
        [token]
      );
      
      return result.rows[0].user_id;
    }
    
    return null;
  } finally {
    client.release();
  }
};

// Middleware for API protection
export interface AuthenticatedRequest extends NextApiRequest {
  user?: User;
}

export const requireAuth = (roles: string[] = []) => {
  return (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void) => {
    return async (req: AuthenticatedRequest, res: NextApiResponse) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return res.status(401).json({ error: 'No token provided' });
        }
        
        const payload = verifyToken(token);
        
        if (!payload) {
          return res.status(401).json({ error: 'Invalid token' });
        }
        
        const user = await findUserById(payload.userId);
        
        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }
        
        if (user.status !== 'active') {
          return res.status(401).json({ error: 'Account not activated' });
        }
        
        if (roles.length > 0 && !roles.includes(user.role)) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        req.user = user;
        return handler(req, res);
      } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    };
  };
};

// Generate random tokens
export const generateRandomToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

