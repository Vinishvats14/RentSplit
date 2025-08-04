import { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors">
        🏠 RentSplit
      </Link>
      
      {user && (
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className={`hover:text-blue-600 transition-colors ${
                isActive('/') ? 'text-blue-600 font-semibold' : 'text-gray-700'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/expenses" 
              className={`hover:text-blue-600 transition-colors ${
                isActive('/expenses') ? 'text-blue-600 font-semibold' : 'text-gray-700'
              }`}
            >
              All Expenses
            </Link>
            <Link 
              to="/house" 
              className={`hover:text-blue-600 transition-colors ${
                isActive('/house') ? 'text-blue-600 font-semibold' : 'text-gray-700'
              }`}
            >
              My House
            </Link>
            <Link 
              to="/add-expense" 
              className={`hover:text-blue-600 transition-colors ${
                isActive('/add-expense') ? 'text-blue-600 font-semibold' : 'text-gray-700'
              }`}
            >
              Add Expense
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Hello, <span className="font-medium">{user.name}</span>
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
