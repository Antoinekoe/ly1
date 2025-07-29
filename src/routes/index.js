import express from "express";
import authRoutes from "./auth.js";
import urlRoutes from "./urls.js";
import adminRoutes from "./admin.js";
import apiRoutes from "./api.js";
import shortUrlRoutes from "./shortUrlRoute.js";

const router = express.Router();

// Mount route groups
router.use("/", urlRoutes); // Home page and URL redirection
router.use("/", apiRoutes); // API endpoints
router.use("/", authRoutes); // Authentication
router.use("/", adminRoutes); // Admin dashboard
router.use("/", shortUrlRoutes);

export default router;
