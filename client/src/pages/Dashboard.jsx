import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getRecentExpenses, getMonthlySummary, getBalanceSheet } from "../api";
import Loader from "../components/Loader";
import ExpenseCard from "../components/ExpenseCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [summary, setSummary] = useState([]);
  const [balance, setBalance] = useState({ totalYouOwe: 0, totalOthersOweYou: 0, netBalance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recentRes, summaryRes, balanceRes] = await Promise.all([
          getRecentExpenses(user.house?._id),
          getMonthlySummary(user.house?._id),
          getBalanceSheet(user.house?._id),
        ]);
        setRecentExpenses(recentRes.recentExpenses || []);
        setSummary(summaryRes.summary || []);
        setBalance(balanceRes || {});
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.house?._id) fetchData();
  }, [user]);

  if (loading) return <Loader />;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">📊 Dashboard</h2>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-gray-600">You Owe</p>
          <p className="text-red-500 text-xl font-bold">₹{balance.totalYouOwe}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-gray-600">Others Owe You</p>
          <p className="text-green-500 text-xl font-bold">₹{balance.totalOthersOweYou}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-gray-600">Net Balance</p>
          <p className="text-blue-500 text-xl font-bold">₹{balance.netBalance}</p>
        </div>
      </div>

      {/* Monthly Expense Chart */}
      <h3 className="text-lg font-semibold mb-3">📅 Monthly Expense Summary</h3>
      <div className="bg-white p-4 rounded shadow mb-6">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={summary.map((amt, idx) => ({ month: new Date(0, idx).toLocaleString('default', { month: 'short' }), amount: amt }))}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#4F46E5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Expenses */}
      <h3 className="text-lg font-semibold mb-3">🧾 Recent Expenses</h3>
      <div className="bg-white p-4 rounded shadow">
        {recentExpenses.length === 0 ? (
          <p className="text-gray-500">No recent expenses.</p>
        ) : (
          recentExpenses.map((expense) => <ExpenseCard key={expense._id} expense={expense} />)
        )}
      </div>
    </div>
  );
};

export default Dashboard;
