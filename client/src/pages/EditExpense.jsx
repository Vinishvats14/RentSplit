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
    splitBetween: [],
    customSplit: [],
  });
  const [receiptFile, setReceiptFile] = useState(null); // For new file upload
  const [submitting, setSubmitting] = useState(false);

  // ✅ Fetch expense details and prefill
  useEffect(() => {
    async function fetchExpense() {
      try {
        const response = await getExpenseById(id);
        setExpense(response.data);
        setFormData({
          description: response.data.description,
          amount: response.data.amount,
          category: response.data.category,
          splitType: response.data.splitType,
          splitBetween: response.data.splitBetween.map((u) => u._id),
          customSplit: response.data.customSplit,
        });
      } catch (err) {
        console.error("Failed to fetch expense:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchExpense();
  }, [id]);

  // ✅ Fetch house members for splitting
  useEffect(() => {
    if (expense?.house) {
      // Members are available from expense.house.members
    }
  }, [expense]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setReceiptFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updateData = new FormData();
      updateData.append("description", formData.description);
      updateData.append("amount", formData.amount);
      updateData.append("category", formData.category);
      updateData.append("splitType", formData.splitType);
      updateData.append("splitBetween", JSON.stringify(formData.splitBetween));
      updateData.append("customSplit", JSON.stringify(formData.customSplit));
      if (receiptFile) updateData.append("receipt", receiptFile);

      await updateExpense(id, updateData);

      alert("✅ Expense updated successfully!");
      navigate(`/expenses/${id}`);
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
        <Link 
          to={`/expense/${id}`} 
          className="text-blue-500 hover:underline"
        >
          ← Back to Details
        </Link>
        <h2 className="text-2xl font-semibold">✏️ Edit Expense</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Receipt Upload */}
        <div>
          <label className="block font-medium mb-1">📎 Receipt (optional)</label>
          {expense?.receipt && (
            <p className="mb-2">
              Current: <a href={expense.receipt} target="_blank" rel="noreferrer" className="text-blue-600 underline">View Receipt</a>
            </p>
          )}
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="border p-2 w-full rounded"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {submitting ? "Updating..." : "Update Expense"}
        </button>
      </form>
    </div>
  );
}
