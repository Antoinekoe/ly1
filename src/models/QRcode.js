import pool from "../config/database.js";
import QRCode from "qrcode";

class QRCodeModel {
  // Create QR code for registered user
  static async create(userId, originalUrl) {
    try {
      const dataURL = await QRCode.toDataURL(originalUrl);
      const result = await pool.query(
        "INSERT INTO qr_code (user_id, original_url, qr_data_url) VALUES ($1, $2, $3) RETURNING *",
        [userId, originalUrl, dataURL]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error creating QR code:", error);
      throw error;
    }
  }

  // Create temporary QR code for anonymous user
  static async createTemp(tempUserId, originalUrl) {
    try {
      const dataURL = await QRCode.toDataURL(originalUrl);
      const result = await pool.query(
        "INSERT INTO temp_qrcode (temp_user_id, qr_url, qr_data_url) VALUES ($1, $2, $3) RETURNING *",
        [tempUserId, originalUrl, dataURL]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error creating temp QR code:", error);
      throw error;
    }
  }

  // Get all active QR codes for a user
  static async getActiveQRCodesByUserId(userId) {
    try {
      const result = await pool.query(
        "SELECT * FROM qr_code WHERE user_id = $1 AND is_active = true",
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error("Error getting active QR codes by user ID:", error);
      throw error;
    }
  }

  // Soft delete a QR code
  static async softDelete(qrCodeId) {
    try {
      const result = await pool.query(
        "UPDATE qr_code SET is_active = false, qr_data_url = NULL WHERE id = $1",
        [qrCodeId]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error soft deleting QR code:", error);
      throw error;
    }
  }

  // Get total scans for a user
  static async getTotalScansByUserId(userId) {
    try {
      const result = await pool.query(
        "SELECT SUM(scans) as total_scans FROM qr_code WHERE user_id = $1 AND is_active = true",
        [userId]
      );
      return parseInt(result.rows[0].total_scans) || 0;
    } catch (error) {
      console.error("Error getting total scans by user ID:", error);
      throw error;
    }
  }

  // Generate QR code data URL (utility method)
  static async generateDataURL(url) {
    try {
      return await QRCode.toDataURL(url);
    } catch (error) {
      console.error("Error generating QR code data URL:", error);
      throw error;
    }
  }
}

export default QRCodeModel;
