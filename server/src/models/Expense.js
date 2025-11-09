import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true, enum: ['rent', 'utilities', 'groceries', 'internet', 'cleaning', 'maintenance', 'other'] },
  house: { type: mongoose.Schema.Types.ObjectId, ref: 'House', required: true },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  splitBetween: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  splitType: { type: String, enum: ['equal', 'custom'], default: 'equal' },
  customSplit: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, amount: { type: Number } }],
  receipt: { type: String },
  isSettled: { type: Boolean, default: false },
  settledOn: { type: Date },
  settledBy: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
],

}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);
