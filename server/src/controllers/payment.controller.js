import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/Payment.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ 1. Create Order
export const createOrder = async (req, res) => {
  try {
    const { amount, paidBy, paidTo, expenseId } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "rs_" + Date.now(),
    };
if (!paidBy || !paidTo || !expenseId) {
  return res.status(400).json({ message: "Missing payment data." });
}

    const order = await razorpay.orders.create(options);

    const payment = await Payment.create({
      orderId: order.id,
      amount,
      paidBy,
      paidTo,
      expenseId,
      status: "pending",
    });

    res.json({ success: true, order, paymentId: payment._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// ✅ 2. Verify Payment
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, dbPaymentId } = req.body;

    const sign = orderId + "|" + paymentId;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign === signature) {
      await Payment.findByIdAndUpdate(dbPaymentId, {
        paymentId,
        signature,
        status: "success",
      });

      return res.json({ success: true });
    }

    res.json({ success: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
