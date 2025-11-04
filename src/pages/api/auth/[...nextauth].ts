import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import AppleProvider from 'next-auth/providers/apple';
import { Adapter, AdapterAccount } from 'next-auth/adapters';
import pool from '@/lib/database';

// Custom adapter to integrate with existing user system
const adapter: Adapter = {
  async createUser(user: { email: string; name?: string | null; image?: string | null }) {
    const client = await pool.connect();
    try {
      // Create user without password (OAuth user)
      const result = await client.query(
        'INSERT INTO users (email, password_hash, status) VALUES ($1, NULL, $2) RETURNING id, email, role, status, created_at',
        [user.email, 'active'] // OAuth users are automatically active
      );
      
      const userId = result.rows[0].id;

      // Create profile if name is provided
      if (user.name) {
        const nameParts = user.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        await client.query(
          'INSERT INTO profiles (user_id, first_name, last_name) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO NOTHING',
          [userId, firstName, lastName]
        );
      }

      return {
        id: userId.toString(),
        email: result.rows[0].email,
        emailVerified: null,
        name: user.name || null,
        image: user.image || null,
      };
    } finally {
      client.release();
    }
  },
  async getUser(id) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT u.id, u.email, u.status, p.first_name, p.last_name 
         FROM users u 
         LEFT JOIN profiles p ON u.id = p.user_id 
         WHERE u.id = $1`,
        [id]
      );
      
      if (result.rows.length === 0) return null;
      
      const user = result.rows[0];
      const name = user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user.first_name || null;

      return {
        id: user.id.toString(),
        email: user.email,
        emailVerified: null,
        name,
        image: null,
      };
    } finally {
      client.release();
    }
  },
  async getUserByEmail(email) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT u.id, u.email, u.status, p.first_name, p.last_name 
         FROM users u 
         LEFT JOIN profiles p ON u.id = p.user_id 
         WHERE u.email = $1`,
        [email]
      );
      
      if (result.rows.length === 0) return null;
      
      const user = result.rows[0];
      const name = user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user.first_name || null;

      return {
        id: user.id.toString(),
        email: user.email,
        emailVerified: null,
        name,
        image: null,
      };
    } finally {
      client.release();
    }
  },
  async linkAccount(account: AdapterAccount) {
    const client = await pool.connect();
    try {
      // Normalize expires_at to epoch seconds (BIGINT) for database storage
      const exp =
        account.expires_at == null
          ? null
          : typeof account.expires_at === 'number'
            ? account.expires_at
            : Math.floor(new Date((account as any).expires_at).getTime() / 1000);

      await client.query(
        `INSERT INTO accounts (
          user_id, type, provider, provider_account_id, 
          refresh_token, access_token, expires_at, 
          token_type, scope, id_token, session_state
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (provider, provider_account_id) 
        DO UPDATE SET 
          user_id = $1,
          refresh_token = $5,
          access_token = $6,
          expires_at = $7,
          token_type = $8,
          scope = $9,
          id_token = $10,
          session_state = $11,
          updated_at = CURRENT_TIMESTAMP`,
        [
          parseInt(account.userId),
          account.type,
          account.provider,
          account.providerAccountId,
          account.refresh_token || null,
          account.access_token || null,
          exp,
          account.token_type || null,
          account.scope || null,
          account.id_token || null,
          account.session_state || null,
        ]
      );
      return account;
    } finally {
      client.release();
    }
  },
  async getUserByAccount({ providerAccountId, provider }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT u.id, u.email, u.status, p.first_name, p.last_name 
         FROM users u
         INNER JOIN accounts a ON u.id = a.user_id
         LEFT JOIN profiles p ON u.id = p.user_id
         WHERE a.provider = $1 AND a.provider_account_id = $2`,
        [provider, providerAccountId]
      );
      
      if (result.rows.length === 0) return null;
      
      const user = result.rows[0];
      const name = user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user.first_name || null;

      return {
        id: user.id.toString(),
        email: user.email,
        emailVerified: null,
        name,
        image: null,
      };
    } finally {
      client.release();
    }
  },
  async createSession({ sessionToken, userId, expires }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO sessions (session_token, user_id, expires) VALUES ($1, $2, $3) RETURNING id, session_token, user_id, expires',
        [sessionToken, parseInt(userId), expires]
      );
      
      return {
        sessionToken: result.rows[0].session_token,
        userId: result.rows[0].user_id.toString(),
        expires: result.rows[0].expires,
      };
    } finally {
      client.release();
    }
  },
  async getSessionAndUser(sessionToken) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT s.id, s.session_token, s.user_id, s.expires,
                u.email, u.status, p.first_name, p.last_name
         FROM sessions s
         INNER JOIN users u ON s.user_id = u.id
         LEFT JOIN profiles p ON u.id = p.user_id
         WHERE s.session_token = $1 AND s.expires > NOW()`,
        [sessionToken]
      );
      
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      const name = row.first_name && row.last_name 
        ? `${row.first_name} ${row.last_name}` 
        : row.first_name || null;

      return {
        session: {
          sessionToken: row.session_token,
          userId: row.user_id.toString(),
          expires: row.expires,
        },
        user: {
          id: row.user_id.toString(),
          email: row.email,
          emailVerified: null,
          name,
          image: null,
        },
      };
    } finally {
      client.release();
    }
  },
  async updateSession({ sessionToken, expires }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE sessions SET expires = $1 WHERE session_token = $2 RETURNING id, session_token, user_id, expires',
        [expires, sessionToken]
      );
      
      if (result.rows.length === 0) return null;
      
      return {
        sessionToken: result.rows[0].session_token,
        userId: result.rows[0].user_id.toString(),
        expires: result.rows[0].expires,
      };
    } finally {
      client.release();
    }
  },
  async deleteSession(sessionToken) {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM sessions WHERE session_token = $1', [sessionToken]);
    } finally {
      client.release();
    }
  },
};

// Build providers array - only include providers with credentials
const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Allow linking OAuth to existing account that shares same email
      allowDangerousEmailAccountLinking: true,
    })
  );
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  providers.push(
    FacebookProvider({
      clientId: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
  providers.push(
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
      issuer: process.env.APPLE_ISSUER || 'https://appleid.apple.com',
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: adapter as Adapter,
  providers,
  pages: {
    signIn: '/auth/sign-in',
    error: '/auth/sign-in',
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: true,
  // Ensure cookies work on http://localhost during development
  useSecureCookies: false,
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true;
    },
    async session({ session, user }) {
      // Add user ID and role to session
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT id, role, status FROM users WHERE id = $1',
          [parseInt(user.id)]
        );
        
        if (result.rows.length > 0) {
          (session as any).user.id = result.rows[0].id;
          (session as any).user.role = result.rows[0].role;
          (session as any).user.status = result.rows[0].status;
        }
      } finally {
        client.release();
      }
      
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Always prefer explicit relative redirects
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      try {
        const u = new URL(url);
        // Same-origin redirects are allowed
        if (u.origin === baseUrl) return url;
      } catch {}
      // Fallback to profile page
      return `${baseUrl}/profile`;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);

