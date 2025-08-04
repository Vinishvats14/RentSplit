// controllers/expenseController.js
import Expense from "../models/Expense.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";

// Create a new expense
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
      customSplit
    } = req.body;
    let receiptUrl = null;
    if (req.file) {
      const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
      receiptUrl = cloudinaryResponse?.secure_url || null;
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
    if (splitType === "custom") {
  // Calculate total custom split amount
  const totalCustomSplit = customSplit.reduce((sum, s) => sum + Number(s.amount || 0), 0);

  if (totalCustomSplit !== amount) {
    return res.status(400).json({
      success: false,
      message: `Custom split total (${totalCustomSplit}) must equal expense amount (${amount})`,
    });
  }
}

    await expense.save();
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    console.error("Error creating expense:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get all expenses for a house
export const getExpensesByHouse = async (req, res) => {
  try {
    const { houseId } = req.params;
    const expenses = await Expense.find({ house: houseId })        //
// _id (houseId)	name
// h1	House       A
// h2	House       B
// And your Expense collection:

// _id	description	house (FK)
// e1	Rent	    h1
// e2	Internet	h1
// e3	Groceries	h2
// If you do:

// Expense.find({ house: "h1" });
// ➡️ You’ll get:

// Rent (e1)
// Internet (e2)
// Because both are linked to House A (h1).
// 👥 Same House, Multiple People?

// Yes, many users can be part of the same house, and many expenses can be logged under that house.

// That's exactly why you're using:

// paidBy: ObjectId (ref: User)
// splitBetween: [ObjectId (ref: User)]
// populate() is a Mongoose method used to replace the referenced ObjectId with actual document data from another collection.

// 🔧 Example from your code:
// You have this schema field in your Expense model:

// paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
// When you query the Expense model normally:

// const expenses = await Expense.find({ house: houseId });
// You’ll get this:

// {
//   "paidBy": "64fc91be73b96fd71b25e3b0" // just the user ID
// }
// But if you use .populate("paidBy", "name email"):

// const expenses = await Expense.find({ house: houseId })
//   .populate("paidBy", "name email");
// You get this instead:

// {
//   "paidBy": {
//     "_id": "64fc91be73b96fd71b25e3b0",
//     "name": "Vinu",
//     "email": "vinu@example.com"
//   }
// }
      .populate("paidBy", "name email")
      .populate("splitBetween", "name email");
    res.status(200).json({ success: true, data: expenses });
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get single expense by ID
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

// Update expense
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If receipt file is updated
    if (req.file) {
      const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
      if (cloudinaryResponse?.secure_url) {
        updates.receipt = cloudinaryResponse.secure_url;
      }
    }

    const updatedExpense = await Expense.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json({ success: true, data: updatedExpense });
  } catch (err) {
    console.error("Error updating expense:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
// controllers/expenseController.js
// Get recent expenses for a house

export const getRecentExpenses = async (req, res) => {
  const { houseId } = req.params;

  try {
    const recentExpenses = await Expense.find({ house: houseId })
      .sort({ date: -1 })         // Latest first
      .limit(10)                  // Last 10 expenses
      .populate("paidBy", "name") // Optional: get payer's name
      .populate("splitBetween", "name"); // Optional: get split users' names

    res.json({ recentExpenses });
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch recent expenses" });
  }
};

// Delete expense
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
// Get monthly summary of expenses for a house
export const getMonthlySummary = async (req, res) => {
  const { houseId } = req.params;
  const currentYear = new Date().getFullYear();

  try {
    const expenses = await Expense.find({ house: houseId }); // ✅ Correct field

    const summary = Array(12).fill(0);

    expenses.forEach((exp) => {
      const month = new Date(exp.createdAt).getMonth(); // ✅ Use createdAt
      if (new Date(exp.createdAt).getFullYear() === currentYear) {
        summary[month] += exp.amount;
      }
    });

    res.json({ success: true, summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating summary' });
  }
};

// Get balance sheet for a house
export const getBalanceSheet = async (req, res) => {
  const { houseId } = req.params;
  const userId = req.user._id.toString();

  try {
    const expenses = await Expense.find({ house: houseId }).populate("splitBetween");

    let youOwe = 0;
    let othersOwe = 0;

    for (let exp of expenses) {
      const total = exp.amount;
      const paidBy = exp.paidBy.toString();

       // ✅ Equal split logic
      if (exp.splitType === "equal") {
        const participants = exp.splitBetween || [];
        const share = total / (participants.length || 1);

        if (participants.some(u => u._id.toString() === userId)) {
          if (paidBy !== userId) {
            // You owe the payer your share
            youOwe += share;
          } else {
            // Others owe you their share (exclude yourself)
            othersOwe += share * (participants.length - 1);
          }
        }
      }

      // ✅ Custom split logic
      if (exp.splitType === "custom" && Array.isArray(exp.customSplit)) {
        for (let s of exp.customSplit) {
          const shareAmount = s.amount;
          const u = s.user._id ? s.user._id.toString() : s.user.toString();

          if (u === userId && paidBy !== userId) {
            youOwe += shareAmount;
          }
          if (paidBy === userId && u !== userId) {
            othersOwe += shareAmount;
          }
        }
      }
    }

    res.status(200).json({
      totalYouOwe: youOwe.toFixed(2),
      totalOthersOweYou: othersOwe.toFixed(2),
      netBalance: (othersOwe - youOwe).toFixed(2),
    });
  } catch (err) {
    console.error("Error calculating balance sheet:", err);
    res.status(500).json({ message: "Error calculating balances" });
  }
};

// Mark as settled
export const settleExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByIdAndUpdate(
      id,
      { isSettled: true, settledOn: new Date() },
      { new: true }
    );
    res.status(200).json({ success: true, data: expense });
  } catch (err) {
    console.error("Error settling expense:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
