import Expense from "../models/Expense.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";

// 🧾 Create expense
export const createExpense = async (req, res) => {
  try {
    const {
      description,
      amount,
      category,
      house,
      paidBy,
      splitBetween,
      splitType,
      customSplit,
    } = req.body;

    console.log("🧾 Creating Expense:", { description, amount, paidBy, splitBetween });

    let receiptUrl = null;
    if (req.file) {
      const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
      receiptUrl = cloudinaryResponse?.secure_url || null;
    }

    // ✅ Validate custom split
    if (splitType === "custom" && Array.isArray(customSplit)) {
      const totalCustomSplit = customSplit.reduce(
        (sum, s) => sum + Number(s.amount || 0),
        0
      );
      if (totalCustomSplit !== Number(amount)) {
        return res.status(400).json({
          success: false,
          message: `Custom split total (${totalCustomSplit}) must equal expense amount (${amount})`,
        });
      }
    }

    const expense = new Expense({
      description,
      amount,
      category,
      house,
      paidBy,
      splitBetween,
      splitType,
      customSplit,
      receipt: receiptUrl,
    });

    await expense.save();
    console.log("✅ Expense saved:", expense._id);
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    console.error("Error creating expense:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// 📋 Get all expenses for a house
export const getExpensesByHouse = async (req, res) => {
  try {
    const { houseId } = req.params;
    const expenses = await Expense.find({ house: houseId })
      .sort({ createdAt: -1 })
      .populate("paidBy", "name email")
      .populate("splitBetween", "name email");

    res.status(200).json({ success: true, data: expenses });
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// 🔍 Get one expense
export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id)
      .populate("paidBy", "name email")
      .populate("splitBetween", "name email");

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    res.status(200).json({ success: true, data: expense });
  } catch (err) {
    console.error("Error fetching expense:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✏️ Update expense
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    let receiptUrl = expense.receipt;
    if (req.file) {
      const result = await uploadOnCloudinary(req.file.path);
      receiptUrl = result.secure_url;
    }

    expense.description = req.body.description || expense.description;
    expense.amount = req.body.amount || expense.amount;
    expense.category = req.body.category || expense.category;
    expense.splitType = req.body.splitType || expense.splitType;
    expense.paidBy = req.body.paidBy || expense.paidBy;
    expense.receipt = receiptUrl;

    await expense.save();

    res.json({ success: true, message: "Expense updated successfully", expense });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ message: "Server error while updating expense" });
  }
};

// 🗑️ Delete expense
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    await Expense.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Expense deleted successfully" });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// 🕒 Get recent expenses
export const getRecentExpenses = async (req, res) => {
  const { houseId } = req.params;
  console.log(`🕒 getRecentExpenses called for houseId: ${houseId}`);
  try {
    const recentExpenses = await Expense.find({ house: houseId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("paidBy", "name")
      .populate("splitBetween", "name");
    console.log(`✅ getRecentExpenses found ${recentExpenses.length} expenses`);
    res.json({ success: true, recentExpenses });
  } catch (error) {
    console.error("❌ getRecentExpenses error:", error);
    res.status(500).json({ message: "Unable to fetch recent expenses" });
  }
};

// 📅 Monthly summary
export const getMonthlySummary = async (req, res) => {
  const { houseId } = req.params;
  console.log(`📅 getMonthlySummary called for houseId: ${houseId}`);
  const currentYear = new Date().getFullYear();
  try {
    const expenses = await Expense.find({ house: houseId });
    console.log(`📅 getMonthlySummary found ${expenses.length} expenses`);
    const summary = Array(12).fill(0);
    expenses.forEach((exp) => {
      const month = new Date(exp.createdAt).getMonth();
      if (new Date(exp.createdAt).getFullYear() === currentYear) {
        summary[month] += exp.amount;
      }
    });
    console.log(`✅ getMonthlySummary done`);
    res.json({ success: true, summary });
  } catch (error) {
    console.error("❌ getMonthlySummary error:", error);
    res.status(500).json({ message: "Error generating summary" });
  }
};

// 💵 Balance sheet
export const getBalanceSheet = async (req, res) => {
  const { houseId } = req.params;
  const userId = req.user._id.toString();
  console.log(`💵 getBalanceSheet called for houseId: ${houseId}, userId: ${userId}`);
  try {
    const expenses = await Expense.find({ house: houseId })
      .populate("splitBetween", "name _id")
      .populate("paidBy", "name _id")
      .populate("customSplit.user", "name _id");

    console.log(`💵 getBalanceSheet found ${expenses.length} expenses`);

    let youOwe = 0,
      othersOwe = 0,
      youOweList = [],
      othersOweYouList = [];

    for (let exp of expenses) {
      if (exp.isSettled) continue; // Skip settled expenses

      const total = exp.amount;
      const paidBy = exp.paidBy?._id?.toString();
      const payerName = exp.paidBy?.name || "Unknown";

      if (exp.splitType === "equal") {
        const participants = exp.splitBetween || [];
        // If participants is empty, assume it's split between all members? No, we can't assume.
        // If participants only has 1 person, share is total.
        const share = total / (participants.length || 1);

        for (let user of participants) {
          if (!user) continue;
          const uId = user._id?.toString();
          if (!uId) continue;
          const uName = user.name;

          // Case 1: I am a participant (uId == userId), but I didn't pay (paidBy != userId).
          if (uId === userId && paidBy !== userId) {
            youOwe += share;
            youOweList.push({
              from: req.user.name,
              to: payerName,
              amount: share.toFixed(2),
              paidTo: exp.paidBy?._id,
              expenseId: exp._id,
            });
          }

          // Case 2: I paid (paidBy == userId), and this participant is someone else (uId != userId).
          if (paidBy === userId && uId !== userId) {
            othersOwe += share;
            othersOweYouList.push({
              from: uName,
              to: req.user.name,
              amount: share.toFixed(2),
              paidTo: req.user._id,
              expenseId: exp._id,
            });
          }
        }
      }

      if (exp.splitType === "custom" && Array.isArray(exp.customSplit)) {
        for (let s of exp.customSplit) {
          if (!s.user) continue;
          const shareAmount = s.amount;
          const u = s.user._id ? s.user._id.toString() : s.user.toString();
          const uName = s.user.name || "Unknown";

          if (u === userId && paidBy !== userId) {
            youOwe += shareAmount;
            youOweList.push({
              from: req.user.name,
              to: payerName,
              amount: shareAmount.toFixed(2),
              paidTo: exp.paidBy?._id,
              expenseId: exp._id,
            });
          }

          if (paidBy === userId && u !== userId) {
            othersOwe += shareAmount;
            othersOweYouList.push({
              from: uName,
              to: req.user.name,
              amount: shareAmount.toFixed(2),
              paidTo: req.user._id,
              expenseId: exp._id,
            });
          }
        }
      }
    }

    console.log(`✅ getBalanceSheet done. You Owe: ${youOwe}, Others Owe: ${othersOwe}`);
    res.status(200).json({
      totalYouOwe: youOwe.toFixed(2),
      totalOthersOweYou: othersOwe.toFixed(2),
      netBalance: (othersOwe - youOwe).toFixed(2),
      youOweList,
      othersOweYouList,
    });
  } catch (err) {
    console.error("❌ Error calculating balance sheet:", err);
    res.status(500).json({ message: "Error calculating balances" });
  }
};

// ✅ Settle expense (Final working version)
export const settleExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const userId = req.user._id; // current logged in user

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // ✅ Mark expense as settled
    expense.isSettled = true;
    expense.settledBy = userId;
    expense.settledOn = new Date();
    await expense.save();

    res.json({
      success: true,
      message: "Expense settled successfully",
      expense,
    });
  } catch (error) {
    console.error("❌ Error settling expense:", error);
    res.status(500).json({ message: "Server error while settling expense" });
  }
};
