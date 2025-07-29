import pool from "../config/database.js";
import { nanoid } from "nanoid";

class Link {
  // Create a new short link for registered user
  static async create(userId, originalUrl) {
    try {
      const shortCode = nanoid(6);
      const result = await pool.query(
        "INSERT INTO links (user_id, short_code, original_url) VALUES ($1, $2, $3) RETURNING *",
        [userId, shortCode, originalUrl]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error creating link:", error);
      throw error;
    }
  }

  // Create a temporary short link for anonymous user
  static async createTemp(tempUserId, originalUrl) {
    try {
      const shortCode = nanoid(6);
      const result = await pool.query(
        "INSERT INTO temp_links (temp_user_id, short_code, original_url) VALUES ($1, $2, $3) RETURNING *",
        [tempUserId, shortCode, originalUrl]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error creating temp link:", error);
      throw error;
    }
  }

  // Find link by short code (check both temp and regular links)
  static async findByShortCode(shortCode) {
    try {
      const result = await pool.query(
        `SELECT 
          COALESCE(temp_links.short_code, links.short_code) as short_code,
          COALESCE(temp_links.original_url, links.original_url) as original_url,
          COALESCE(temp_links.clicks, links.clicks) as clicks,
          CASE 
            WHEN temp_links.short_code IS NOT NULL THEN 'temp'
            ELSE 'regular'
          END as link_type
        FROM temp_links 
        FULL OUTER JOIN links ON temp_links.short_code = links.short_code 
        WHERE (temp_links.short_code = $1 OR links.short_code = $1) 
        AND COALESCE(temp_links.short_code, links.short_code) IS NOT NULL`,
        [shortCode]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error finding link by short code:", error);
      throw error;
    }
  }

  // Increment click count for temp link
  static async incrementTempClicks(shortCode) {
    try {
      const result = await pool.query(
        "UPDATE temp_links SET clicks = clicks + 1 WHERE short_code = $1 RETURNING short_code, clicks",
        [shortCode]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error incrementing temp link clicks:", error);
      throw error;
    }
  }

  // Increment click count for regular link
  static async incrementClicks(shortCode) {
    try {
      const result = await pool.query(
        "UPDATE links SET clicks = clicks + 1 WHERE short_code = $1 RETURNING short_code, clicks",
        [shortCode]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error incrementing link clicks:", error);
      throw error;
    }
  }

  // Get all active links for a user
  static async getActiveLinksByUserId(userId) {
    try {
      const result = await pool.query(
        "SELECT * FROM links WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC",
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error("Error getting active links by user ID:", error);
      throw error;
    }
  }

  // Soft delete a link (set is_active to false)
  static async softDelete(linkId) {
    try {
      const result = await pool.query(
        "UPDATE links SET is_active = false, short_code = NULL WHERE id = $1",
        [linkId]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error soft deleting link:", error);
      throw error;
    }
  }

  // Get total clicks for a user
  static async getTotalClicksByUserId(userId) {
    try {
      const result = await pool.query(
        "SELECT SUM(clicks) as total_clicks FROM links WHERE user_id = $1 AND is_active = true",
        [userId]
      );
      return parseInt(result.rows[0].total_clicks) || 0;
    } catch (error) {
      console.error("Error getting total clicks by user ID:", error);
      throw error;
    }
  }
}

export default Link;
