import express from "express";
import UrlController from "../controllers/urlController.js";

const router = express.Router();

router.get("/:id", UrlController.redirectToOriginal);

export default router;
