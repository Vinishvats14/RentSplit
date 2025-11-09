import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createExpense,
  getExpensesByHouse,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getRecentExpenses,
  getMonthlySummary,
  getBalanceSheet,
  settleExpense,
} from "../controllers/expense.controller.js";

const router = express.Router();

// 🔒 Protect all routes
router.use(protect);

// ➕ Create new expense
router.post("/", upload.single("receipt"), createExpense);

// 🏠 Get all expenses for a house
router.get("/house/:houseId", getExpensesByHouse);

// 📊 Get recent expenses
router.get("/house/:houseId/recent", getRecentExpenses);

// 📈 Monthly summary
router.get("/house/:houseId/monthly-summary", getMonthlySummary);

// 💰 Balance sheet for a house
router.get("/house/:houseId/balance-sheet", getBalanceSheet);

// 🧾 Get, update, or delete one expense
router
  .route("/:id")
  .get(getExpenseById)
  .put(upload.single("receipt"), updateExpense)
  .delete(deleteExpense);

// ✅ Settle expense (fixed version)
router.put("/:expenseId/settle", settleExpense);

export default router;
