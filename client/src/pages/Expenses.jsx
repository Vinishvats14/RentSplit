import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getExpensesByHouse } from "../api";
import Loader from "../components/Loader";
import ExpenseCard from "../components/ExpenseCard";

const Expenses = () => {
  const { user } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, settled

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        if (user?.house?._id) {
          const response = await getExpensesByHouse(user.house._id);
          console.log("📌 API Full Response:", response);
          console.log("📌 Expenses Array:", response.data);

          setExpenses(response.data || []);
        }
      } catch (err) {
        console.error("Error loading expenses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [user]);

  const filteredExpenses = expenses.filter((expense) => {
    if (filter === "pending") return !expense.isSettled;
    if (filter === "settled") return expense.isSettled;
    return true; // all
  });

  if (loading) return <Loader />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">🧾 All Expenses</h2>
        <Link
          to="/add-expense"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Add Expense
        </Link>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded ${
            filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          All ({expenses.length})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-3 py-1 rounded ${
            filter === "pending" ? "bg-orange-500 text-white" : "bg-gray-200"
          }`}
        >
          Pending ({expenses.filter((e) => !e.isSettled).length})
        </button>
        <button
          onClick={() => setFilter("settled")}
          className={`px-3 py-1 rounded ${
            filter === "settled" ? "bg-green-500 text-white" : "bg-gray-200"
          }`}
        >
          Settled ({expenses.filter((e) => e.isSettled).length})
        </button>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded shadow">
        {filteredExpenses.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {filter === "all" 
              ? "No expenses found. Start by adding your first expense!"
              : `No ${filter} expenses found.`
            }
          </div>
        ) : (
          <div className="divide-y">
            {filteredExpenses.map((expense) => (
              <ExpenseCard key={expense._id} expense={expense} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;
