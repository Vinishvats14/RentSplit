import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { createOrder, verifyPayment, settleExpense, getBalanceSheet } from "../api";
import { AuthContext } from "../context/AuthContext";

export default function Payment() {
  const { user, setUser } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const amount = searchParams.get("amount");
  const to = searchParams.get("to");
  const from = searchParams.get("from");
  const expenseId = searchParams.get("expenseId");
  const paidTo = searchParams.get("paidTo");

  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const startPayment = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Invalid amount");
      return;
    }

    setLoading(true);
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert("⚠️ Razorpay failed to load. Check your connection.");
      setLoading(false);
      return;
    }

    try {
      const orderData = await createOrder({
        amount,
        paidBy: user?._id,
        paidTo,
        expenseId,
      });

      const { order, paymentId: dbPaymentId } = orderData || {};

      if (!order || !order.id) {
        throw new Error("Invalid order returned from server");
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "RentSplit",
        description: `Payment to ${to}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verificationRes = await verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              dbPaymentId,
            });

            if (!verificationRes?.success) {
              alert("❌ Payment verification failed!");
              return;
            }

            if (expenseId) {
              await settleExpense(expenseId);
            }

            // Refresh balance and update AuthContext only if totals changed
            try {
              if (user?.house?._id) {
                const balanceRes = await getBalanceSheet(user.house._id);
                const totalYouOwe = Number(balanceRes?.totalYouOwe ?? balanceRes?.total_you_owe ?? 0);
                const totalOthersOweYou = Number(balanceRes?.totalOthersOweYou ?? balanceRes?.total_others_owe_you ?? 0);

                if (typeof setUser === "function") {
                  setUser((prev = {}) => {
                    if (prev?.youOwe === totalYouOwe && prev?.owedToYou === totalOthersOweYou) return prev;
                    return { ...prev, youOwe: totalYouOwe, owedToYou: totalOthersOweYou };
                  });
                } else {
                  localStorage.setItem("youOwe", String(totalYouOwe));
                  localStorage.setItem("owedToYou", String(totalOthersOweYou));
                }
              }
            } catch (balanceErr) {
              console.error("Failed to refresh balance after payment:", balanceErr);
            }

            navigate("/dashboard?success=true", { replace: true });
          } catch (err) {
            console.error("Settlement error:", err);
            alert("Payment done but failed to mark as settled. Try refreshing.");
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: "#4f46e5" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("❌ Payment initiation failed:", err);
      alert("Something went wrong while starting payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-4">💳 Payment</h1>

      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-700 text-lg mb-2">
          <b>{from}</b> has to pay <b>{to}</b>
        </p>

        <p className="text-3xl font-bold text-blue-600 mb-4">₹{amount}</p>

        <button
          onClick={startPayment}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg disabled:bg-gray-400"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
}
