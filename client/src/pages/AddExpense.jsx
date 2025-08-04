import { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import { createExpense, uploadReceipt } from "../api";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";

const AddExpense = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("rent");
  const [splitType, setSplitType] = useState("equal");
  const [customSplit, setCustomSplit] = useState([]);
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const members = useMemo(() => user?.house?.members || [], [user?.house?.members]);

  // Debug logs
  console.log("🏠 AddExpense - User:", user);
  console.log("🏠 AddExpense - House:", user?.house);
  console.log("👥 AddExpense - Members:", members);

  useEffect(() => {
    if (splitType === "custom") {
      setCustomSplit(members.map((m) => ({ user: m._id, name: m.name, amount: "" })));
    }
  }, [splitType, members]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let receiptUrl = null;

      if (receiptFile) {
        try {
          console.log("📎 Uploading receipt file:", receiptFile);
          const uploadRes = await uploadReceipt(receiptFile);
          console.log("✅ Upload response:", uploadRes);
          receiptUrl = uploadRes.url || uploadRes.secure_url || null;
        } catch (uploadError) {
          console.error("❌ Upload failed:", uploadError);
          // Continue without receipt if upload fails
          alert("Receipt upload failed, but expense will be saved without it.");
        }
      }

      const expenseData = {
        description,
        amount: parseFloat(amount),
        category,
        house: user?.house?._id,
        paidBy: user._id,
        splitBetween: members.map((m) => m._id),
        splitType,
        customSplit:
          splitType === "custom"
            ? customSplit.map((c) => ({ user: c.user, amount: parseFloat(c.amount) || 0 }))
            : [],
        receipt: receiptUrl,
      };

      console.log("💸 Creating expense:", expenseData);
      await createExpense(expenseData);
      console.log("✅ Expense created successfully!");
      navigate("/"); // Navigate to dashboard
    } catch (error) {
      console.error("❌ Error adding expense:", error);
      alert("Failed to add expense: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <Loader />
  ) : !user?.house ? (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <h3 className="font-bold">No House Found</h3>
        <p>You need to create or join a house before adding expenses.</p>
        <button
          onClick={() => navigate("/house")}
          className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Go to House Page
        </button>
      </div>
    </div>
  ) : (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">➕ Add New Expense</h2>
      <form onSubmit={handleSubmit} className="bg-white shadow rounded p-4 space-y-4">
        <div>
          <label className="block text-gray-700">Description</label>
          <input
            type="text"
            className="w-full border p-2 rounded mt-1"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Amount (₹)</label>
          <input
            type="number"
            className="w-full border p-2 rounded mt-1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Category</label>
          <select
            className="w-full border p-2 rounded mt-1"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="rent">Rent</option>
            <option value="utilities">Utilities</option>
            <option value="groceries">Groceries</option>
            <option value="internet">Internet</option>
            <option value="cleaning">Cleaning</option>
            <option value="maintenance">Maintenance</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700">Split Type</label>
          <select
            className="w-full border p-2 rounded mt-1"
            value={splitType}
            onChange={(e) => setSplitType(e.target.value)}
          >
            <option value="equal">Equal Split</option>
            <option value="custom">Custom Split</option>
          </select>
        </div>

        {splitType === "custom" && (
          <div className="border p-3 rounded bg-gray-50">
            <p className="mb-2 text-sm font-medium text-gray-700">Custom Split:</p>
            {customSplit.map((c, idx) => (
              <div key={c.user} className="flex justify-between mb-2">
                <span>{c.name}</span>
                <input
                  type="number"
                  placeholder="Amount"
                  className="w-24 border p-1 rounded"
                  value={c.amount}
                  onChange={(e) => {
                    const updated = [...customSplit];
                    updated[idx].amount = e.target.value;
                    setCustomSplit(updated);
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="block text-gray-700">Upload Receipt (Optional)</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setReceiptFile(e.target.files[0])}
            className="mt-1"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          Add Expense
        </button>
      </form>
    </div>
  );
};

export default AddExpense;
