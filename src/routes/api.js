import express from "express";
import QrController from "../controllers/qrController.js";
import { validateUrl } from "../middleware/validation.js";

const router = express.Router();

// QR code creation for anonymous users
router.post("/create-qr-code", validateUrl, QrController.createTempQrCode);

// QR code download for anonymous users
router.post("/download-temp-qr-code", QrController.downloadTempQrCode);

// Favicon
router.get("/favicon.ico", (req, res) => {
  res.sendFile(getFaviconPath());
});

export default router;
