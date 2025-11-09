// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

// Components
import Layout from "./components/Layout";
import Loader from "./components/Loader";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import House from "./pages/House";
import AddExpense from "./pages/AddExpense";
import ExpenseDetails from "./pages/ExpenseDetails";
import EditExpense from "./pages/EditExpense";
import Expenses from "./pages/Expenses";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";

export default function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Loader />;

  return (
    <Routes>
      {/* If not logged in → show only login/register */}
      {!user ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        // If logged in → wrap pages inside Layout (Sidebar included)
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/house" element={<House />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/expense/:id" element={<ExpenseDetails />} />
          <Route path="/expenses/:id/edit" element={<EditExpense />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      )}
    </Routes>
  );
}
