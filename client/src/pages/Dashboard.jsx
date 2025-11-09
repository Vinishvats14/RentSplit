import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

import {
  getRecentExpenses,
  getMonthlySummary,
  getBalanceSheet,
} from "../api";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import ExpenseCard from "../components/ExpenseCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [recentExpenses, setRecentExpenses] = useState([]);
  const [summary, setSummary] = useState([]);
  const [balance, setBalance] = useState({});
  const [loading, setLoading] = useState(true);

  // 🔄 Fetch Dashboard Data
const location = useLocation();

useEffect(() => {
  const fetchData = async () => {
    console.log("🏠 Dashboard: Fetch starting... user =", user);
    try {
      if (!user?.house?._id) {
        console.warn("⚠️ No house found for user:", user);
        setLoading(false);
        return;
      }

      const houseId = user.house._id;
      console.log("📡 Using houseId:", houseId);

      const [recentRes, summaryRes, balanceRes] = await Promise.all([
        getRecentExpenses(houseId, { cache: "no-store" }),
        getMonthlySummary(houseId, { cache: "no-store" }),
        getBalanceSheet(houseId, { cache: "no-store" }),
      ]);

      setRecentExpenses(recentRes?.recentExpenses || []);
      setSummary(summaryRes?.summary || []);
      setBalance(balanceRes || {});
    } catch (err) {
      console.error("❌ Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (user) fetchData();
}, [user, location.search]); // ✅ re-run when ?success=true appears

  if (loading) return <Loader />;

  if (!user) {
    return (
      <div className="p-6 text-center text-gray-600">
        ⚠️ No user data found. Try logging in again.
      </div>
    );
  }

  // 🎯 Render Dashboard
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">📊 Dashboard</h2>

      {/* BALANCE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* YOU OWE */}
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-600 text-center font-medium">You Owe</p>
          <p className="text-red-500 text-xl font-bold text-center">
            ₹{balance.totalYouOwe || 0}
          </p>

          {balance.youOweList?.length ? (
            <ul className="mt-3 text-sm text-gray-700 border-t border-gray-100 pt-2 space-y-2 max-h-44 overflow-y-auto">
              {balance.youOweList.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded border"
                >
                  <span>
                    {item.fromName || item.from} → {item.toName || item.to}
                  </span>

                  <button
                    onClick={() => {
                      if (!item.paidTo || !item.expenseId) {
                        alert(
                          "⚠️ Payment details missing. Please refresh or try again."
                        );
                        console.error("Missing IDs:", item);
                        return;
                      }

                      navigate(
                        `/payment?amount=${item.amount}&to=${item.toName || item.to}&from=${
                          item.fromName || item.from
                        }&expenseId=${item.expenseId}&paidTo=${item.paidTo}`
                      );
                    }}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                  >
                    Pay
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm text-center mt-2">No dues 🎉</p>
          )}
        </div>

        {/* OTHERS OWE YOU */}
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-600 text-center font-medium">
            Others Owe You
          </p>
          <p className="text-green-500 text-xl font-bold text-center">
            ₹{balance.totalOthersOweYou || 0}
          </p>

          {balance.othersOweYouList?.length ? (
            <ul className="mt-3 text-sm text-gray-700 border-t border-gray-100 pt-2 space-y-2 max-h-44 overflow-y-auto">
              {balance.othersOweYouList.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded border"
                >
                  <span>
                    {item.fromName || item.from} → {item.toName || item.to}
                  </span>
                  <span className="text-green-600 font-medium">
                    ₹{item.amount}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm text-center mt-2">
              All settled ✅
            </p>
          )}
        </div>

        {/* NET BALANCE */}
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-gray-600 font-medium">Net Balance</p>
          <p
            className={`text-xl font-bold ${
              balance.netBalance >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            ₹{balance.netBalance || 0}
          </p>
        </div>
      </div>

      {/* MONTHLY CHART */}
      <h3 className="text-lg font-semibold mb-3">📅 Monthly Expense Summary</h3>
      <div className="bg-white p-4 rounded shadow mb-6">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={summary.map((amt, idx) => ({
              month: new Date(0, idx).toLocaleString("default", {
                month: "short",
              }),
              amount: amt,
            }))}
          >
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#4F46E5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* RECENT EXPENSES */}
      <h3 className="text-lg font-semibold mb-3">🧾 Recent Expenses</h3>
      <div className="bg-white p-4 rounded shadow">
        {recentExpenses.length === 0 ? (
          <p className="text-gray-500">No recent expenses.</p>
        ) : (
          recentExpenses.map((expense) => (
            <ExpenseCard key={expense._id} expense={expense} />
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
