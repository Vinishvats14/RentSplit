import { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

import {
  getRecentExpenses,
  getMonthlySummary,
  getBalanceSheet,
} from "../api";
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
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [recentExpenses, setRecentExpenses] = useState([]);
  const [summary, setSummary] = useState([]);
  const [balance, setBalance] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchingRef = useRef(false); // prevent concurrent/loop fetches
  const lastHouseIdRef = useRef(null);

  // Normalize helpers
  const normalizeBalance = (b) => {
    if (!b) return { totalYouOwe: 0, totalOthersOweYou: 0, netBalance: 0, youOweList: [], othersOweYouList: [] };

    const youOweList = b.youOweList || b.you_owe_list || b.you_owes || b.you_ows || [];
    const othersOweYouList = b.othersOweYouList || b.others_owe_you || b.others_owes || [];

    const sumList = (list) =>
      (list || []).reduce((s, item) => s + Number(item?.amount ?? item?.amt ?? 0), 0);

    const totalYouOwe = Number(b.totalYouOwe ?? b.total_you_owe ?? sumList(youOweList) ?? 0);
    const totalOthersOweYou = Number(b.totalOthersOweYou ?? b.total_others_owe_you ?? sumList(othersOweYouList) ?? 0);
    const netBalance = Number(b.netBalance ?? b.net_balance ?? (totalOthersOweYou - totalYouOwe));

    const normList = (list) =>
      (list || []).map((it) => ({
        amount: Number(it?.amount ?? it?.amt ?? 0),
        from: it.from || it.fromName || it.paidBy || it.payer,
        to: it.to || it.toName || it.payee,
        expenseId: it.expenseId || it.expense_id || it._id,
        paidTo: it.paidTo || it.paid_to,
        ...it,
      }));

    return {
      ...b,
      totalYouOwe,
      totalOthersOweYou,
      netBalance,
      youOweList: normList(youOweList),
      othersOweYouList: normList(othersOweYouList),
    };
  };

  const normalizeSummary = (s) => {
    const arr = s?.summary ?? s ?? [];
    if (!Array.isArray(arr)) return [];
    if (arr.every((v) => typeof v === "number")) {
      return arr.map((amt, idx) => ({
        month: new Date(0, idx).toLocaleString("default", { month: "short" }),
        amount: Number(amt || 0),
      }));
    }
    return arr.map((v, idx) => ({
      month: v.month || v.name || new Date(0, idx).toLocaleString("default", { month: "short" }),
      amount: Number(v.amount ?? v.total ?? v.value ?? 0),
    }));
  };

  useEffect(() => {
    // only depend on houseId and search param — avoids re-run on full user object changes
    const houseId = user?.house?._id ?? null;
    let mounted = true;

    const fetchData = async () => {
      if (!houseId) {
        console.warn("⚠️ Dashboard: No houseId found, stopping loader.");
        setLoading(false);
        return;
      }

      try {
        console.warn("🏠 Dashboard: Fetch starting... houseId =", houseId);

        const [recentRes, summaryRes, balanceRes] = await Promise.all([
          getRecentExpenses(houseId),
          getMonthlySummary(houseId),
          getBalanceSheet(houseId),
        ]);

        console.warn("📥 Dashboard API success:", { recentRes, summaryRes, balanceRes });

        if (!mounted) return;

        setRecentExpenses(recentRes?.recentExpenses || recentRes || []);
        setSummary(normalizeSummary(summaryRes));

        const normBalance = normalizeBalance(balanceRes);
        setBalance(normBalance);

        // update AuthContext only when totals change (avoid creating new user object every time)
        if (typeof setUser === "function") {
          setUser((prev = {}) => {
            if (prev?.youOwe === normBalance.totalYouOwe && prev?.owedToYou === normBalance.totalOthersOweYou) {
              return prev;
            }
            return { ...prev, youOwe: normBalance.totalYouOwe, owedToYou: normBalance.totalOthersOweYou };
          });
        } else {
          localStorage.setItem("youOwe", String(normBalance.totalYouOwe));
          localStorage.setItem("owedToYou", String(normBalance.totalOthersOweYou));
        }
      } catch (err) {
        console.error("❌ Error loading dashboard:", err);
      } finally {
        if (mounted) {
          console.warn("✅ Dashboard: Fetch finished, setting loading to false.");
          setLoading(false);
        }
      }
    };

    // Fetch when houseId exists OR when search param changes (payment success)
    if (houseId) {
      fetchData();
    } else {
      // If no houseId, stop loading immediately
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.house?._id, location.search]); // minimal deps

  // Failsafe: If loading takes too long, force it off
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn("⏰ Dashboard: Force stopping loader after timeout.");
        setLoading(false);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) return <Loader />;

  if (!user) {
    return (
      <div className="p-6 text-center text-gray-600">
        ⚠️ No user data found. Try logging in again.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">📊 Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-600 text-center font-medium">You Owe</p>
          <p className="text-red-500 text-xl font-bold text-center">
            ₹{balance.totalYouOwe ?? 0}
          </p>

          {balance.youOweList?.length ? (
            <ul className="mt-3 text-sm text-gray-700 border-t border-gray-100 pt-2 space-y-2 max-h-44 overflow-y-auto">
              {balance.youOweList.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded border"
                >
                  <span>
                    {item.from || item.fromName} → {item.to || item.toName}
                  </span>

                  <button
                    onClick={() => {
                      if (!item.paidTo || !item.expenseId) {
                        alert("⚠️ Payment details missing. Please refresh or try again.");
                        console.error("Missing IDs:", item);
                        return;
                      }

                      navigate(
                        `/payment?amount=${item.amount}&to=${encodeURIComponent(item.to || item.toName)}&from=${encodeURIComponent(item.from || item.fromName)}&expenseId=${item.expenseId}&paidTo=${item.paidTo}`
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

        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-600 text-center font-medium">Others Owe You</p>
          <p className="text-green-500 text-xl font-bold text-center">
            ₹{balance.totalOthersOweYou ?? 0}
          </p>

          {balance.othersOweYouList?.length ? (
            <ul className="mt-3 text-sm text-gray-700 border-t border-gray-100 pt-2 space-y-2 max-h-44 overflow-y-auto">
              {balance.othersOweYouList.map((item, index) => (
                <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded border">
                  <span>{item.from || item.fromName} → {item.to || item.toName}</span>
                  <span className="text-green-600 font-medium">₹{item.amount}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm text-center mt-2">All settled ✅</p>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-gray-600 font-medium">Net Balance</p>
          <p className={`text-xl font-bold ${(balance.netBalance ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
            ₹{balance.netBalance ?? 0}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-gray-600 font-medium">Total Spent (This Month)</p>
          <p className="text-xl font-bold text-blue-600">
            ₹{summary.length > 0 ? summary[new Date().getMonth()]?.amount || 0 : 0}
          </p>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-3">📅 Monthly Expense Summary</h3>
      <div className="bg-white p-4 rounded shadow mb-6">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={
              Array.isArray(summary)
                ? summary.map((s, idx) => {
                    if (typeof s === "number") {
                      return { month: new Date(0, idx).toLocaleString("default", { month: "short" }), amount: Number(s) };
                    }
                    return { month: s.month || s.name || new Date(0, idx).toLocaleString("default", { month: "short" }), amount: Number(s.amount ?? s.total ?? 0) };
                  })
                : []
            }
          >
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#4F46E5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3 className="text-lg font-semibold mb-3">🧾 Recent Expenses</h3>
      <div className="bg-white p-4 rounded shadow">
        {recentExpenses.length === 0 ? (
          <p className="text-gray-500">No recent expenses.</p>
        ) : (
          recentExpenses.map((expense) => (
            <ExpenseCard key={expense._id || expense.id} expense={expense} />
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;