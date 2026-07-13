import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

let pool = null;

const connectDB = async () => {
  let connectionString = process.env.POSTGRES_URI || process.env.DATABASE_URL;

  if (!connectionString && !process.env.PGHOST) {
    console.log("⚠️  No PostgreSQL credentials found in environment. Using default local PostgreSQL fallback: postgresql://postgres:postgres@localhost:5432/investai");
    connectionString = "postgresql://postgres:postgres@localhost:5432/investai";
  }

  try {
    pool = new Pool({
      connectionString: connectionString,
      host: process.env.PGHOST,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
      ssl: process.env.POSTGRES_SSL === "true" ? { rejectUnauthorized: false } : false
    });

    // Test connection
    const client = await pool.connect();
    console.log("🐘 PostgreSQL connected successfully.");
    client.release();

    // Create tables
    await createTables();
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err.message);
    process.exit(1);
  }
};

const createTables = async () => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      _id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      is_verified BOOLEAN DEFAULT FALSE,
      is_approved BOOLEAN DEFAULT FALSE,
      is_blocked BOOLEAN DEFAULT FALSE,
      wallet_balance NUMERIC DEFAULT 0,
      verification_token VARCHAR(255),
      verification_token_expire TIMESTAMP,
      reset_password_token VARCHAR(255),
      reset_password_expire TIMESTAMP,
      watchlist TEXT DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createReportsTable = `
    CREATE TABLE IF NOT EXISTS reports (
      _id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      ticker VARCHAR(50),
      decision VARCHAR(50) NOT NULL,
      confidence INTEGER NOT NULL,
      summary TEXT NOT NULL,
      positive_factors TEXT DEFAULT '[]',
      risks TEXT DEFAULT '[]',
      analysis TEXT DEFAULT '{}',
      is_shared BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createPortfolioTable = `
    CREATE TABLE IF NOT EXISTS portfolio_items (
      _id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      ticker VARCHAR(50) NOT NULL,
      shares NUMERIC NOT NULL,
      purchase_price NUMERIC NOT NULL,
      purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(createUsersTable);
    await pool.query(createReportsTable);
    await pool.query(createPortfolioTable);
    // Add provider column if it doesn't exist yet (idempotent migration)
    await pool.query(`
      ALTER TABLE reports ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'gemini';
    `);
    console.log("🐘 PostgreSQL database tables initialized successfully.");
  } catch (err) {
    console.error("❌ Error initializing PostgreSQL tables:", err.message);
    process.exit(1);
  }
};

const query = async (text, params) => {
  if (!pool) {
    throw new Error("Database pool has not been initialized. Call connectDB() first.");
  }
  return pool.query(text, params);
};

export { connectDB as default, query, pool };
