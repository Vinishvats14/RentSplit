import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getExpenseById, deleteExpense, settleExpense } from "../api";
import Loader from "../components/Loader";

const ExpenseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const res = await getExpenseById(id);
        setExpense(res.data);
      } catch (err) {
        console.error("Failed to fetch expense:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpense();
  }, [id]);

  const handleSettle = async () => {
    try {
      await settleExpense(id);
      alert("✅ Expense marked as settled!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error settling expense:", err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(id);
        alert("🗑️ Expense deleted!");
        navigate("/dashboard");
      } catch (err) {
        console.error("Error deleting expense:", err);
      }
    }
  };

  if (loading) return <Loader />;

  if (!expense) {
    return <p className="text-center text-gray-500 mt-10">❌ Expense not found</p>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <Link 
          to="/expenses" 
          className="text-blue-500 hover:underline"
        >
          ← Back to Expenses
        </Link>
        <h2 className="text-2xl font-semibold">🧾 Expense Details</h2>
      </div>
      <div className="bg-white shadow rounded p-6 space-y-4">
        <p><strong>Description:</strong> {expense.description}</p>
        <p><strong>Amount:</strong> ₹{expense.amount}</p>
        <p><strong>Category:</strong> {expense.category}</p>
        <p><strong>Paid By:</strong> {expense.paidBy?.name}</p>

        <div>
          <strong>Split Between:</strong>
          <ul className="list-disc ml-6">
            {expense.splitBetween.map((u) => (
              <li key={u._id}>{u.name}</li>
            ))}
          </ul>
        </div>

        {expense.splitType === "custom" && (
          <div>
            <strong>Custom Split:</strong>
            <ul className="list-disc ml-6">
              {expense.customSplit.map((c, idx) => (
                <li key={idx}>
                  {c.user?.name || "User"} - ₹{c.amount}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p>
          <strong>Status:</strong>{" "}
          {expense.isSettled ? (
            <span className="text-green-600">✅ Settled on {new Date(expense.settledOn).toLocaleDateString()}</span>
          ) : (
            <span className="text-red-600">❌ Unsettled</span>
          )}
        </p>

        {expense.receipt && (
          <div>
            <strong>Receipt:</strong>
            <div className="mt-2">
              {expense.receipt.endsWith(".pdf") ? (
                <a
                  href={expense.receipt}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  📄 View PDF Receipt
                </a>
              ) : (
                <img
                  src={expense.receipt}
                  alt="Receipt"
                  className="mt-2 w-64 rounded shadow"
                />
              )}
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-4">
          {!expense.isSettled && (
            <button
              onClick={handleSettle}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Mark as Settled
            </button>
          )}
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete Expense
          </button>
          <button
            onClick={() => navigate(`/expenses/${id}/edit`)}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            ✏️ Edit
          </button>

        </div>
      </div>
    </div>
  );
};

export default ExpenseDetails;
