// API Base URL Configuration

// Local development backend (adjust port if different)
export const API_BASE = import.meta.env.MODE === "development" ? "http://localhost:4000/api" : import.meta.env.VITE_API_BASE ;

// Example: For production, set VITE_API_BASE in your .env file
// VITE_API_BASE=https://your-production-backend.com/api
