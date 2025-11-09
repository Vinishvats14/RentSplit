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

// Simple CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // allow frontend to send cookies
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "none",
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
