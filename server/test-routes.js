import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './src/routes/user.routes.js';
import houseRoutes from './src/routes/house.routes.js';
import expenseRoutes from './src/routes/expense.routes.js';
import uploadRoutes from './src/routes/upload.routes.js';

const app = express();
const PORT = 3001; // Using different port to avoid conflicts

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Test middleware to bypass auth for testing
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/upload', uploadRoutes);

// Route to list all available routes
app.get('/api/routes', (req, res) => {
  const routes = [];
  
  // Extract routes from the app
  function extractRoutes(layer, basePath = '') {
    if (layer.route) {
      routes.push({
        path: basePath + layer.route.path,
        methods: Object.keys(layer.route.methods)
      });
    } else if (layer.name === 'router' && layer.regexp) {
      const routerPath = basePath + layer.regexp.source
        .replace('\\/?(?=\\/|$)', '')
        .replace(/\\\//g, '/')
        .replace(/\\.*/, '')
        .replace(/\^/, '')
        .replace(/\$/, '');
      
      layer.handle.stack.forEach(subLayer => {
        extractRoutes(subLayer, routerPath);
      });
    }
  }

  app._router.stack.forEach(layer => {
    extractRoutes(layer);
  });

  res.json({
    message: 'Available routes in your server:',
    routes: routes.sort((a, b) => a.path.localeCompare(b.path))
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Route testing server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🧪 Route testing server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}/health to check server status`);
  console.log(`Visit http://localhost:${PORT}/api/routes to see all available routes`);
});
