import QRCodeModel from "../models/QRcode.js";
import User from "../models/user.js";

class QrController {
  // Create QR code for registered user
  static async createQrCode(req, res) {
    try {
      const userId = req.session.passport.user.id;
      const originalUrl = req.body.value;

      // Check if user has reached limit
      const userQrCodes = await QRCodeModel.getActiveQRCodesByUserId(userId);
      if (userQrCodes.length >= 10) {
        req.session.qrCodesLimitReached = true;
        return res.redirect("/admin");
      }

      // Create the QR code
      const newQrCode = await QRCodeModel.create(userId, originalUrl);
      res.redirect("/admin");
    } catch (error) {
      console.error("Error creating QR code:", error);
      req.session.error = "Erreur lors de la création du QR code";
      res.redirect("/admin");
    }
  }

  // Create temporary QR code for anonymous user
  static async createTempQrCode(req, res) {
    try {
      const originalUrl = req.body.urlToQR;

      // Get or create temporary user
      const tempUserId = await User.getOrCreateTempUser(req.ip);

      // Create temporary QR code
      const newQrCode = await QRCodeModel.createTemp(tempUserId, originalUrl);

      // Store QR code data in session for display
      req.session.qrCodeDataURL = newQrCode.qr_data_url;
      req.session.activeMode = "qr";
      req.session.isQrCodeCreated = true;

      res.redirect("/");
    } catch (error) {
      console.error("Error creating temp QR code:", error);
      res.redirect("/");
    }
  }

  // Download QR code from admin dashboard
  static async downloadQrCode(req, res) {
    try {
      const dataURL = req.body.qr_code;
      const base64 = dataURL.replace(/^data:image\/png;base64,/, "");
      const buffer = Buffer.from(base64, "base64");

      // Set headers for download
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Disposition", "attachment; filename=qr-code.png");
      res.setHeader("Content-Length", buffer.length);

      res.send(buffer);
    } catch (error) {
      console.error("Error downloading QR code:", error);
      res.redirect("/");
    }
  }

  // Download temporary QR code from home page
  static async downloadTempQrCode(req, res) {
    try {
      if (req.session.qrCodeDataURL) {
        const dataURL = req.session.qrCodeDataURL;
        const base64 = dataURL.replace(/^data:image\/png;base64,/, "");
        const buffer = Buffer.from(base64, "base64");

        // Set headers for download
        res.setHeader("Content-Type", "image/png");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=qr-code.png"
        );
        res.setHeader("Content-Length", buffer.length);

        res.send(buffer);
      } else {
        res.redirect("/");
      }
    } catch (error) {
      console.error("Error downloading temp QR code:", error);
      res.redirect("/");
    }
  }

  // Get QR code dashboard data for user
  static async getQrDashboardData(userId) {
    try {
      const qrCodes = await QRCodeModel.getActiveByUserId(userId);
      const totalScans = await QRCodeModel.getTotalScansByUserId(userId);

      return {
        qrCodes,
        numberOfQrCodes: qrCodes.length,
        numberOfScans: totalScans,
        qrCodesLimitReached: qrCodes.length > 9,
      };
    } catch (error) {
      console.error("Error getting QR dashboard data:", error);
      return {
        qrCodes: [],
        numberOfQrCodes: 0,
        numberOfScans: 0,
        qrCodesLimitReached: false,
      };
    }
  }

  // Delete a QR code (soft delete)
  static async deleteQrCode(req, res) {
    try {
      const qrCodeId = req.body.qr_code_id;

      const success = await QRCodeModel.softDelete(qrCodeId);

      if (success) {
        console.log("QR code deleted successfully");
      } else {
        console.error("Failed to delete QR code");
      }

      res.redirect("/admin");
    } catch (error) {
      console.error("Error deleting QR code:", error);
      res.redirect("/admin");
    }
  }

  // Generate QR code data URL (utility method)
  static async generateQrCodeDataUrl(url) {
    try {
      return await QRCodeModel.generateDataURL(url);
    } catch (error) {
      console.error("Error generating QR code data URL:", error);
      throw error;
    }
  }
}

export default QrController;
