import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'function_provider',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default pool;

// Database initialization SQL
export const initDatabase = async () => {
  const client = await pool.connect();
  
  try {
    // Create tables based on the database diagram
    await client.query(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Profiles table
      CREATE TABLE IF NOT EXISTS profiles (
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        first_name VARCHAR(255),
        last_name VARCHAR(48),
        title VARCHAR(120),
        function VARCHAR(120),
        geo_id BIGINT,
        avatar_id BIGINT,
        pen_name VARCHAR(120),
        PRIMARY KEY (user_id)
      );

      -- User tokens table
      CREATE TABLE IF NOT EXISTS user_tokens (
        token VARCHAR(512) PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        token_type VARCHAR(20),
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Refresh tokens table
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(512),
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Geopoints table
      CREATE TABLE IF NOT EXISTS geopoints (
        id BIGSERIAL PRIMARY KEY,
        lat DECIMAL(10,7) NOT NULL,
        lng DECIMAL(10,7) NOT NULL,
        city VARCHAR(120),
        country VARCHAR(120)
      );

      -- File assets table
      CREATE TABLE IF NOT EXISTS file_assets (
        id BIGSERIAL PRIMARY KEY,
        url VARCHAR(500) NOT NULL,
        mime_type VARCHAR(80),
        size_bytes INTEGER,
        uploader_id BIGINT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- User locations table
      CREATE TABLE IF NOT EXISTS user_locations (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        lat DECIMAL(10,7),
        lng DECIMAL(10,7),
        captured_at TIMESTAMP,
        is_live BOOLEAN DEFAULT false
      );

      -- Live sessions table
      CREATE TABLE IF NOT EXISTS live_sessions (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        stream_key VARCHAR(120),
        started_at TIMESTAMP,
        ended_at TIMESTAMP
      );

      -- Simulation settings table
      CREATE TABLE IF NOT EXISTS simulation_settings (
        id BIGSERIAL PRIMARY KEY,
        owner_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        key VARCHAR(80),
        value VARCHAR(200)
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_user_tokens_token ON user_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};


