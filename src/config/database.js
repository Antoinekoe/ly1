import pg from "pg";
import env from "dotenv";
env.config();

// Database connection pool
const pool = new pg.Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.DATABASE_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
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
  pool.query("SELECT NOW()", (err, res) => {
    if (err) {
      console.error("Database connection failed:", err);
    } else {
      console.log("Database connected successfully");
    }
  });
}

export default pool;
