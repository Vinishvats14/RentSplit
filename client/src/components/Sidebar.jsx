// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { Home, List, PlusCircle, House, LogOut } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  const youOwe = user?.youOwe || 0; // fallback values
  const owedToYou = user?.owedToYou || 0;

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-white shadow-lg flex flex-col justify-between">
      {/* Top section */}
      <div>
        {/* Profile */}
        <div className="flex flex-col items-center py-6 border-b">
          <img
            src={user?.photoURL || "https://i.pravatar.cc/100"}
            alt="Profile"
            className="w-16 h-16 rounded-full mb-2 object-cover"
          />
          <h2 className="text-lg font-semibold capitalize">
            {user?.name || "User"}
          </h2>
        </div>

        {/* Summary */}
        <div className="px-4 py-4 border-b text-sm">
          <p className="flex justify-between">
            <span className="font-medium">You Owe:</span>
            <span className="text-red-600 font-semibold">₹{youOwe}</span>
          </p>
          <p className="flex justify-between mt-1">
            <span className="font-medium">You're Owed:</span>
            <span className="text-green-600 font-semibold">₹{owedToYou}</span>
          </p>
        </div>

        {/* Nav Links */}
        <nav className="mt-4 flex flex-col">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-2 hover:bg-gray-100 ${
                isActive ? "bg-gray-100 font-semibold" : ""
              }`
            }
          >
            <Home size={18} /> Dashboard
          </NavLink>

          <NavLink
            to="/expenses"
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-2 hover:bg-gray-100 ${
                isActive ? "bg-gray-100 font-semibold" : ""
              }`
            }
          >
            <List size={18} /> All Expenses
          </NavLink>

          <NavLink
            to="/house"
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-2 hover:bg-gray-100 ${
                isActive ? "bg-gray-100 font-semibold" : ""
              }`
            }
          >
            <House size={18} /> My House
          </NavLink>

          <NavLink
            to="/add-expense"
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-2 hover:bg-gray-100 ${
                isActive ? "bg-gray-100 font-semibold" : ""
              }`
            }
          >
            <PlusCircle size={18} /> Add Expense
          </NavLink>
        </nav>
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="flex items-center justify-center gap-2 m-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
      >
        <LogOut size={18} /> Logout
      </button>
    </div>
  );
};

export default Sidebar;
