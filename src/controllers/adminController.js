import Link from "../models/link.js";
import QRCodeModel from "../models/QRcode.js";
import QrController from "./qrController.js";
import passport from "passport";

class AdminController {
  // Render admin dashboard
  static async renderDashboard(req, res) {
    try {
      if (!req.isAuthenticated()) {
        console.log("User not authenticated, redirecting to login");
        return res.render("login.ejs");
      }

      const userId = req.session.passport.user.id;

      // Get URL data
      const urlData = await Link.getActiveLinksByUserId(userId);
      const totalClicks = await Link.getTotalClicksByUserId(userId);

      // Get QR code data
      const qrData = await QRCodeModel.getActiveQRCodesByUserId(userId);
      const totalScans = await QRCodeModel.getTotalScansByUserId(userId);

      // Check limits
      const limits = {
        linksLimitReached: urlData.length > 9,
        qrCodesLimitReached: qrData.length > 9,
      };

      res.render("admin.ejs", {
        qr_codes: qrData,
        links: urlData,
        numberOfLinks: urlData.length,
        numberOfQRCodes: qrData.length,
        numberOfClicks: totalClicks,
        numberOfScans: totalScans,
        type: req.session.type,
        linksLimitReached: limits.linksLimitReached,
        qrCodesLimitReached: limits.qrCodesLimitReached,
        error: req.session.error,
        isRegistered: req.session.isRegistered,
        limitError: req.session.limitError,
      });
    } catch (error) {
      console.error("Error rendering admin dashboard:", error);
      res.status(500).send("Error loading dashboard");
    }
  }

  // Create URL or QR code based on type
  static async createUrl(req, res) {
    try {
      req.session.type = req.body.type;
      const userId = req.session.passport.user.id;
      const originalUrl = req.body.value;

      if (req.body.type === "link") {
        // Create short URL
        const userLinks = await Link.getActiveLinksByUserId(userId);
        if (userLinks.length >= 10) {
          req.session.linksLimitReached = true;
          return res.redirect("/admin");
        }

        await Link.create(userId, originalUrl);
      } else {
        // Create QR code
        const userQrCodes = await QRCodeModel.getActiveQRCodesByUserId(userId);
        if (userQrCodes.length >= 10) {
          req.session.qrCodesLimitReached = true;
          return res.redirect("/admin");
        }

        await QRCodeModel.create(userId, originalUrl);
      }

      res.redirect("/admin");
    } catch (error) {
      console.error("Error creating URL/QR code:", error);
      req.session.error = "Erreur lors de la création";
      res.redirect("/admin");
    }
  }

  // Delete a URL
  static async deleteUrl(req, res) {
    try {
      const linkId = req.body.link_id;
      const success = await Link.softDelete(linkId);

      if (success) {
        console.log("Link deleted successfully");
      } else {
        console.error("Failed to delete link");
      }

      res.redirect("/admin");
    } catch (error) {
      console.error("Error deleting URL:", error);
      res.redirect("/admin");
    }
  }

  // Delete a QR code
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
      res.redirect("/admin");
    }
  }
}

export default AdminController;
