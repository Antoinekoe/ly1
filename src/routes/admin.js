import express from "express";
import AdminController from "../controllers/adminController.js";
import { createUrlLimiter } from "../middleware/rateLimiting.js";
import { validateUrl } from "../middleware/validation.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// All admin routes require authentication
router.use(requireAuth);

// Admin dashboard
router.get("/admin", AdminController.renderDashboard);

// URL management
router.post(
  "/admin/create",
  createUrlLimiter,
  validateUrl,
  AdminController.createUrl
);
router.post("/delete-link", AdminController.deleteUrl);

// QR code management
router.post("/delete-qr-code", AdminController.deleteQrCode);
router.post("/download-qr-code", AdminController.downloadQrCode);

export default router;
