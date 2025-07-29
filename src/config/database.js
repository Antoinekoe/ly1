import pg from "pg";

// Database connection pool
const pool = new pg.Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.DATABASE_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connecitonTimeoutMillis: 2000,
});

// Add error handling for the pool
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// Test the connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Database connected successfully");
  }
});

export default pool;
