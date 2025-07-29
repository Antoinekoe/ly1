import express from "express";
import passport from "passport";
import AuthController from "../controllers/authController.js";
import { loginLimiter, signupLimiter } from "../middleware/rateLimiting.js";

const router = express.Router();

// Display authentication pages
router.get("/login", AuthController.renderLogin);
router.get("/signup", AuthController.renderSignup);

// Process authentication forms
router.post("/login", loginLimiter, AuthController.login);
router.post("/signup", signupLimiter, AuthController.register);

// Google OAuth routes
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get("/auth/google/admin", AuthController.handleGoogleAuth);

// Logout
router.get("/logout", AuthController.logout);

export default router;
