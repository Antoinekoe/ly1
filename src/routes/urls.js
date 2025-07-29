import express from "express";
import UrlController from "../controllers/urlController.js";
import { createUrlLimiter } from "../middleware/rateLimiting.js";
import { validateUrl } from "../middleware/validation.js";

const router = express.Router();

// Home page
router.get("/", UrlController.renderHome);

// Mode switching
router.get("/switch-to-url", UrlController.switchToUrlMode);
router.get("/switch-to-qr", UrlController.switchToQrMode);

// URL creation
router.post("/create-url", validateUrl, UrlController.createTempUrl);

// Main redirect route for short URLs
router.get("/:id", UrlController.redirectToOriginal);

export default router;
