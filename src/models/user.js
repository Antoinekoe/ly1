import pool from "../config/database.js";
import bcrypt from "bcrypt";

const saltRounds = 10;

class User {
  // Create or retrieve temporary user by IP address
  static async getOrCreateTempUser(ip) {
    try {
      // First, try to find existing user with this IP
      let result = await pool.query("SELECT id FROM temp_users WHERE ip = $1", [
        ip,
      ]);

      if (result.rows.length === 0) {
        // If no user exists, create a new one
        result = await pool.query(
          "INSERT INTO temp_users (ip) VALUES ($1) RETURNING id",
          [ip]
        );
      }
      return result.rows[0].id;
    } catch (error) {
      console.error("Error in getOrCreateTempUser:", error);
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  }

  // Find user by email (excluding Google users)
  static async findByEmailLocal(email) {
    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE email = $1 AND google_id IS NULL",
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error finding local user by email:", error);
      throw error;
    }
  }

  // Create new user with password
  static async create(email, password) {
    try {
      const hash = await bcrypt.hash(password, saltRounds);
      const result = await pool.query(
        "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *",
        [email, hash]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Create new user with Google OAuth
  static async createGoogleUser(email, googleId) {
    try {
      const result = await pool.query(
        "INSERT INTO users (email, password_hash, google_id) VALUES ($1, $2, $3) RETURNING *",
        [email, "google_id", googleId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error creating Google user:", error);
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error("Error verifying password:", error);
      throw error;
    }
  }
}

export default User;
