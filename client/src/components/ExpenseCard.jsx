import { Link } from "react-router-dom";

const ExpenseCard = ({ expense }) => {
  return (
    <div className="flex justify-between items-center border-b py-3 px-2 hover:bg-gray-50 transition">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-800">{expense.description}</p>
          {expense.isSettled && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              ✅ Settled
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">
          Paid by <span className="font-medium">{expense.paidBy?.name}</span> 
          · ₹{expense.amount} · {expense.category}
        </p>
        {expense.receipt && (
          <a
            href={expense.receipt}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            📎 View Receipt
          </a>
        )}
      </div>
      <div className="flex gap-2">
        <Link
          to={`/expense/${expense._id}`}
          className="text-blue-500 hover:underline text-sm px-2 py-1 rounded hover:bg-blue-50"
        >
          View
        </Link>
        <Link
          to={`/expenses/${expense._id}/edit`}
          className="text-yellow-600 hover:underline text-sm px-2 py-1 rounded hover:bg-yellow-50"
        >
          Edit
        </Link>
      </div>
    </div>
  );
};

export default ExpenseCard;
