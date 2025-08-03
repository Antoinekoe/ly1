import pg from "pg";
import env from "dotenv";
env.config();

// Determine if we're in production
const isProduction = process.env.NODE_ENV === "production";

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
  // SSL configuration - only use SSL if DATABASE_URL is provided (production)
  ssl:
    process.env.DATABASE_URL && isProduction
      ? {
          rejectUnauthorized: false,
          sslmode: "require",
        }
      : false,
});

// Error handling
pool.on("error", (err) => {
  console.error("Database connection error:", err);
  if (isProduction) {
    // In production, don't exit the process, just log the error
    console.error("Database error in production - check monitoring");
  } else {
    // In development, you might want to exit for debugging
    console.error("Database error in development");
  }
});

// Test connection only in development
if (!isProduction) {
  pool.query("SELECT NOW()", (err, res) => {
    if (err) {
      console.error("Database connection test failed:", err);
    } else {
      console.log("Database connected successfully");
    }
  });
}

export default pool;
