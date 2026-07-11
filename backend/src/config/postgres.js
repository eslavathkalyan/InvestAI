import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

let pool = null;
let isConnected = false;

const initPostgres = async () => {
  const connectionString = process.env.POSTGRES_URI || process.env.DATABASE_URL;
  
  if (!connectionString && !process.env.PGHOST) {
    console.log("⚠️  PostgreSQL is not configured. Relational database sync is disabled.");
    return null;
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
    isConnected = true;

    // Initialize schema
    await createTables();
  } catch (err) {
    console.error("❌ PostgreSQL connection error:", err.message);
    console.log("Continuing backend execution with MongoDB only.");
    pool = null;
  }
};

const createTables = async () => {
  if (!pool) return;

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      is_approved BOOLEAN DEFAULT FALSE,
      is_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createReportsTable = `
    CREATE TABLE IF NOT EXISTS reports (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      ticker VARCHAR(50),
      decision VARCHAR(50) NOT NULL,
      confidence INTEGER NOT NULL,
      summary TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(createUsersTable);
    await pool.query(createReportsTable);
    console.log("🐘 PostgreSQL tables initialized successfully.");
  } catch (err) {
    console.error("❌ Error creating PostgreSQL tables:", err.message);
  }
};

const query = async (text, params) => {
  if (!pool) {
    return { rows: [] };
  }
  return pool.query(text, params);
};

const isPostgresConnected = () => isConnected;

export { initPostgres, query, isPostgresConnected, pool };
