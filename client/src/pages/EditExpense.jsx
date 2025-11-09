import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getExpenseById, updateExpense } from "../api";
import Loader from "../components/Loader";

export default function EditExpense() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [expense, setExpense] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "rent",
    splitType: "equal",
    paidBy: "",
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Fetch existing expense
  useEffect(() => {
    async function fetchExpense() {
      try {
        const response = await getExpenseById(id);
        const exp = response.data;
        setExpense(exp);
        setFormData({
          description: exp.description || "",
          amount: exp.amount || "",
          category: exp.category || "rent",
          splitType: exp.splitType || "equal",
          paidBy: exp.paidBy?._id || exp.paidBy || "",
        });
      } catch (err) {
        console.error("❌ Failed to fetch expense:", err);
        alert("Failed to fetch expense details");
      } finally {
        setLoading(false);
      }
    }
    fetchExpense();
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    setReceiptFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append("description", formData.description);
      data.append("amount", formData.amount);
      data.append("category", formData.category);
      data.append("splitType", formData.splitType);
      data.append("paidBy", formData.paidBy);
      if (receiptFile) data.append("receipt", receiptFile);

      await updateExpense(id, data);
      alert("✅ Expense updated successfully!");
      navigate(`/expense/${id}`);
    } catch (err) {
      console.error("Error updating expense:", err);
      alert("❌ Failed to update expense");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-xl mx-auto bg-white p-6 shadow-md rounded">
      <div className="flex items-center gap-4 mb-4">
        <Link to={`/expense/${id}`} className="text-blue-500 hover:underline">
          ← Back to Details
        </Link>
        <h2 className="text-2xl font-semibold">✏️ Edit Expense</h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`space-y-4 ${submitting ? "opacity-75" : ""}`}
      >
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />

        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        >
          <option value="rent">Rent</option>
          <option value="utilities">Utilities</option>
          <option value="groceries">Groceries</option>
          <option value="internet">Internet</option>
          <option value="cleaning">Cleaning</option>
          <option value="maintenance">Maintenance</option>
          <option value="other">Other</option>
        </select>

        <select
          name="splitType"
          value={formData.splitType}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        >
          <option value="equal">Equal</option>
          <option value="custom">Custom</option>
        </select>

        {/* File upload */}
        <div>
          <label className="block font-medium mb-1">📎 Receipt (optional)</label>
          {expense?.receipt && (
            <p className="mb-2 text-sm">
              Current:{" "}
              <a
                href={expense.receipt}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                View Receipt
              </a>
            </p>
          )}
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="border p-2 w-full rounded"
          />
          {receiptFile && (
            <p className="text-sm text-gray-600 mt-1">
              Selected: {receiptFile.name}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-2 rounded text-white ${
            submitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {submitting ? "Updating..." : "Update Expense"}
        </button>
      </form>
    </div>
  );
}
