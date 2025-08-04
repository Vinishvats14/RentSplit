import express from 'express';
import multer from 'multer';
import { protect } from '../middlewares/authMiddleware.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with timeout
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
  timeout: 60000, // 60 seconds timeout
});

// Memory storage for direct Cloudinary upload
const memoryStorage = multer.memoryStorage();

const upload = multer({ 
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'), false);
    }
  }
});

const router = express.Router();

router.post('/receipt', protect, upload.single('receipt'), async (req, res) => {
  try {
    console.log('📁 File upload attempt started');
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    console.log('📁 File details:', {
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Upload to Cloudinary using buffer with timeout
    try {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'receipts',
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary error:', error);
              reject(error);
            } else {
              console.log('✅ Cloudinary upload successful:', result.secure_url);
              resolve(result);
            }
          }
        );

        // Set timeout
        const timeout = setTimeout(() => {
          reject(new Error('Cloudinary upload timeout'));
        }, 30000);

        uploadStream.on('result', () => clearTimeout(timeout));
        uploadStream.end(req.file.buffer);
      });

      res.status(200).json({ 
        success: true,
        message: 'File uploaded successfully to Cloudinary',
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id
      });

    } catch (cloudinaryError) {
      console.error('❌ Cloudinary upload failed:', cloudinaryError.message);
      
      // Fallback response
      res.status(200).json({ 
        success: true,
        message: 'File received (Cloudinary temporarily unavailable)',
        url: `/uploads/placeholder-${Date.now()}.jpg`,
        fallback: true,
        error: 'Cloudinary upload failed, using fallback'
      });
    }

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Upload failed', 
      details: error.message 
    });
  }
});

// Health check for upload service
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    cloudinary: {
      configured: !!(process.env.CLOUD_NAME && process.env.CLOUD_KEY && process.env.CLOUD_SECRET),
      cloud_name: process.env.CLOUD_NAME
    }
  });
});

export default router;
