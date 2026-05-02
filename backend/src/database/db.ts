import { newDb } from 'pg-mem';

// Create a single in-memory PostgreSQL database instance (singleton)
const db = newDb();

// pg-mem supports the uuid-ossp extension natively
db.public.interceptQueries(q => {
  // Allow CREATE EXTENSION queries to pass silently
  if (/create\s+extension/i.test(q.sql)) {
    return [];
  }
  return null;
});

// Create pg-compatible adapter
const { Pool: PgMemPool } = db.adapters.createPg();

// Singleton pool instance
let poolInstance: InstanceType<typeof PgMemPool> | null = null;

export function getPool(): InstanceType<typeof PgMemPool> {
  if (!poolInstance) {
    poolInstance = new PgMemPool();
  }
  return poolInstance;
}

// Initialize database schema
export async function initializeDatabase(): Promise<void> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    // Users table — use TEXT id, UUID generated in application layer
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(100) UNIQUE NOT NULL,
        nickname VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Reports table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        danger_level INTEGER NOT NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        address TEXT,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✅ Database initialized successfully (in-memory PostgreSQL via pg-mem)');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default db;
