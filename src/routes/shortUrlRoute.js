import express from "express";
import UrlController from "../controllers/urlController.js";
import Link from "../models/link.js";

const router = express.Router();

router.get("/:id", async (req, res, next) => {
  const shortCode = req.params.id;

  try {
    const link = await Link.findByShortCode(shortCode);
    if (link) {
      return UrlController.redirectToOriginal(req, res);
    }
  } catch (error) {
    console.error("Error checking short code:", error);
  }

  next();
});

export default router;
