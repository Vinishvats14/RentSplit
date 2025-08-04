import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mock authentication middleware for testing
const mockAuth = (req, res, next) => {
  req.user = { id: 'test-user-id', name: 'Test User' };
  next();
};

// Test user routes
app.post('/api/users/register', (req, res) => {
  res.json({ message: 'Register route working', endpoint: 'POST /api/users/register' });
});

app.post('/api/users/login', (req, res) => {
  res.json({ message: 'Login route working', endpoint: 'POST /api/users/login' });
});

app.get('/api/users/me', mockAuth, (req, res) => {
  res.json({ message: 'Get user profile route working', endpoint: 'GET /api/users/me', user: req.user });
});

app.post('/api/users/logout', (req, res) => {
  res.json({ message: 'Logout route working', endpoint: 'POST /api/users/logout' });
});

// Test house routes
app.get('/api/houses', mockAuth, (req, res) => {
  res.json({ message: 'Get houses route working', endpoint: 'GET /api/houses' });
});

app.post('/api/houses', mockAuth, (req, res) => {
  res.json({ message: 'Create house route working', endpoint: 'POST /api/houses' });
});

app.put('/api/houses/:id', mockAuth, (req, res) => {
  res.json({ message: 'Update house route working', endpoint: 'PUT /api/houses/:id', houseId: req.params.id });
});

app.delete('/api/houses/:id', mockAuth, (req, res) => {
  res.json({ message: 'Delete house route working', endpoint: 'DELETE /api/houses/:id', houseId: req.params.id });
});

app.post('/api/houses/:id/join', mockAuth, (req, res) => {
  res.json({ message: 'Join house route working', endpoint: 'POST /api/houses/:id/join', houseId: req.params.id });
});

app.post('/api/houses/:id/leave', mockAuth, (req, res) => {
  res.json({ message: 'Leave house route working', endpoint: 'POST /api/houses/:id/leave', houseId: req.params.id });
});

// Test expense routes
app.get('/api/expenses/house/:houseId', mockAuth, (req, res) => {
  res.json({ message: 'Get expenses by house route working', endpoint: 'GET /api/expenses/house/:houseId', houseId: req.params.houseId });
});

app.post('/api/expenses', mockAuth, (req, res) => {
  res.json({ message: 'Create expense route working', endpoint: 'POST /api/expenses' });
});

app.get('/api/expenses/:id', mockAuth, (req, res) => {
  res.json({ message: 'Get expense by ID route working', endpoint: 'GET /api/expenses/:id', expenseId: req.params.id });
});

app.put('/api/expenses/:id', mockAuth, (req, res) => {
  res.json({ message: 'Update expense route working', endpoint: 'PUT /api/expenses/:id', expenseId: req.params.id });
});

app.delete('/api/expenses/:id', mockAuth, (req, res) => {
  res.json({ message: 'Delete expense route working', endpoint: 'DELETE /api/expenses/:id', expenseId: req.params.id });
});

app.put('/api/expenses/:id/settle', mockAuth, (req, res) => {
  res.json({ message: 'Settle expense route working', endpoint: 'PUT /api/expenses/:id/settle', expenseId: req.params.id });
});

app.get('/api/expenses/house/:houseId/recent', mockAuth, (req, res) => {
  res.json({ message: 'Get recent expenses route working', endpoint: 'GET /api/expenses/house/:houseId/recent', houseId: req.params.houseId });
});

app.get('/api/expenses/house/:houseId/monthly-summary', mockAuth, (req, res) => {
  res.json({ message: 'Get monthly summary route working', endpoint: 'GET /api/expenses/house/:houseId/monthly-summary', houseId: req.params.houseId });
});

app.get('/api/expenses/house/:houseId/balance-sheet', mockAuth, (req, res) => {
  res.json({ message: 'Get balance sheet route working', endpoint: 'GET /api/expenses/house/:houseId/balance-sheet', houseId: req.params.houseId });
});

// Test upload route
app.post('/api/upload/receipt', mockAuth, (req, res) => {
  res.json({ message: 'Upload receipt route working', endpoint: 'POST /api/upload/receipt' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Route testing server is running',
    timestamp: new Date().toISOString()
  });
});

// Route summary
app.get('/api/routes', (req, res) => {
  const routes = [
    // User routes
    'POST /api/users/register',
    'POST /api/users/login', 
    'GET /api/users/me',
    'POST /api/users/logout',
    
    // House routes
    'GET /api/houses',
    'POST /api/houses',
    'PUT /api/houses/:id',
    'DELETE /api/houses/:id',
    'POST /api/houses/:id/join',
    'POST /api/houses/:id/leave',
    
    // Expense routes
    'GET /api/expenses/house/:houseId',
    'POST /api/expenses',
    'GET /api/expenses/:id',
    'PUT /api/expenses/:id',
    'DELETE /api/expenses/:id',
    'PUT /api/expenses/:id/settle',
    'GET /api/expenses/house/:houseId/recent',
    'GET /api/expenses/house/:houseId/monthly-summary',
    'GET /api/expenses/house/:houseId/balance-sheet',
    
    // Upload routes
    'POST /api/upload/receipt'
  ];

  res.json({
    message: 'Available routes in your server:',
    totalRoutes: routes.length,
    routes: routes
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🧪 Route testing server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}/health to check server status`);
  console.log(`Visit http://localhost:${PORT}/api/routes to see all available routes`);
});
