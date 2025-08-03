import pg from "pg";
import env from "dotenv";
env.config();

// Database connection pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  // Fallback to individual variables if DATABASE_URL not available
  user: process.env.USER || process.env.PGUSER,
  host: process.env.HOST || process.env.PGHOST,
  database: process.env.DATABASE || process.env.PGDATABASE,
  password: process.env.PASSWORD || process.env.PGPASSWORD,
  port: process.env.DATABASE_PORT || process.env.PGPORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Add SSL for production
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false, sslmode: "require" }
      : false,
});

// Error handling
pool.on("error", (err) => {
  if (process.env.NODE_ENV === "production") {
    // Maybe send alert to monitoring service
    console.error("Database error in production - check monitoring");
  } else {
    process.exit(-1); // Only exit in development
  }
});

// Conditional connection test
if (process.env.NODE_ENV === "development") {
  pool.query("SELECT NOW()", (err, res) => {});
}

export default pool;
