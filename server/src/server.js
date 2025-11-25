import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.routes.js';
import houseRoutes from './routes/house.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import session from 'express-session';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ Trust proxy is required for cookies to work on Render/Vercel (behind load balancer)
app.set("trust proxy", 1);

// ...existing code...
const allowedOrigins = [
  (process.env.CLIENT_URL || "").replace(/(^"|"$)/g, ""),
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow non-browser requests (curl, server-to-server)
      if (!origin) return callback(null, true);

      // normalize origin (strip accidental quotes)
      const normalized = origin.replace(/(^"|"$)/g, "");

      // allow explicit whitelist
      if (allowedOrigins.includes(normalized)) return callback(null, true);

      // allow any vercel preview / production domain under vercel.app
      if (normalized.endsWith(".vercel.app") || normalized.endsWith(".vercel.app/")) {
        return callback(null, true);
      }

      // allow localhost patterns
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized)) {
        return callback(null, true);
      }

      console.warn("Blocked CORS origin:", normalized);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// ...existing code...

app.use(session({
  secret: process.env.SESSION_SECRET || "rentsplit_fallback_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
}));



app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🏠 RentSplit API Server',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      houses: '/api/houses', 
      expenses: '/api/expenses',
      upload: '/api/upload'
    },
    documentation: {
      health: '/health',
      routes: '/api/routes'
    }
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT
  });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}).catch((err) => console.log(`❌ DB Connection Error: ${err.message}`));
