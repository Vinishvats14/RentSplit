import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js"; // ✅ now using centralized upload
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// ✅ Upload receipt to Cloudinary directly
router.post("/receipt", protect, upload.single("receipt"), async (req, res) => {
  try {
    console.log("📁 File upload attempt started");

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    console.log("📁 File details:", {
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    // Cloudinary upload
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "receipts",
      resource_type: "auto",
    });

    console.log("✅ Cloudinary upload successful:", uploadResult.secure_url);

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({
      success: false,
      error: "Upload failed",
      details: error.message,
    });
  }
});

// ✅ Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    cloudinaryConfigured: !!(
      process.env.CLOUD_NAME &&
      process.env.CLOUD_KEY &&
      process.env.CLOUD_SECRET
    ),
  });
});

export default router;
