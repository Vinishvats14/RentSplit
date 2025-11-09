import { Link } from "react-router-dom";

export default function PaymentSuccess() {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-3">✅ Payment Successful!</h1>
        <p className="text-gray-700 mb-6">Your payment has been verified successfully.</p>
        <Link
          to="/dashboard"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Go Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
