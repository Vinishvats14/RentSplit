import express from 'express';
import { 
  createExpense, 
  getExpensesByHouse, 
  getExpenseById,   // correct name in your controller
  updateExpense, 
  getRecentExpenses,
  getMonthlySummary,
  getBalanceSheet,
  deleteExpense,
  settleExpense
} from '../controllers/expense.controller.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get all expenses for a house
router.get('/house/:houseId', getExpensesByHouse);

// Create a new expense
router.post('/', createExpense);

// Get, update, or delete single expense by ID
router
  .route('/:id')
  .get(getExpenseById)
  .put(updateExpense)
  .delete(deleteExpense);

// Settle an expense
router.put('/:id/settle', settleExpense);

// Get recent expenses for a house
router.get('/house/:houseId/recent', getRecentExpenses);

// Get monthly summary of expenses for a house
router.get('/house/:houseId/monthly-summary', getMonthlySummary);

// Get balance sheet for a house
router.get('/house/:houseId/balance-sheet', getBalanceSheet);

export default router;
