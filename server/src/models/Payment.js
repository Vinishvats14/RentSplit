import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  paymentId: { type: String },
  signature: { type: String },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  paidTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  expenseId: { type: mongoose.Schema.Types.ObjectId, ref: "Expense" },
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
