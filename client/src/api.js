import axios from "axios";
import { API_BASE } from "./config";

axios.defaults.withCredentials = true; // ✅ Always send cookies

// ========================== 🔑 AUTH APIs ==========================

// Register user
export const registerUser = async (data) => {
  const res = await axios.post(`${API_BASE}/users/register`, data);
  return res.data;
};

// Login user (sets cookie in backend)
export const loginUser = async (data) => {
  const res = await axios.post(`${API_BASE}/users/login`, data);
  return res.data;
};

// Get current logged-in user (backend reads cookie)
export const getProfile = async () => {
  const res = await axios.get(`${API_BASE}/users/me`);
  return res.data;
};

// Logout user (clears cookie in backend)
export const logoutUser = async () => {
  const res = await axios.post(`${API_BASE}/users/logout`);
  return res.data;
};

// ========================== 🏠 HOUSE APIs ==========================
export const getHouse = async () => {
  const res = await axios.get(`${API_BASE}/houses`);
  return res.data;
};
export const createHouse = async (data) => {
  const res = await axios.post(`${API_BASE}/houses`, data);
  return res.data;
};
export const updateHouse = async (id, data) => {
  const res = await axios.put(`${API_BASE}/houses/${id}`, data);
  return res.data;
};
export const joinHouse = async (id) => {
  const res = await axios.post(`${API_BASE}/houses/${id}/join`);
  return res.data;
};
export const leaveHouse = async (id) => {
  const res = await axios.post(`${API_BASE}/houses/${id}/leave`);
  return res.data;
};

// ========================== 💸 EXPENSE APIs ==========================
export const getExpensesByHouse = async (houseId) => {
  const res = await axios.get(`${API_BASE}/expenses/house/${houseId}`);
  return res.data;
};
export const createExpense = async (data) => {
  const res = await axios.post(`${API_BASE}/expenses`, data);
  return res.data;
};
export const getExpenseById = async (id) => {
  const res = await axios.get(`${API_BASE}/expenses/${id}`);
  return res.data;
};
export const updateExpense = async (id, data) => {
  const res = await axios.put(`${API_BASE}/expenses/${id}`, data);
  return res.data;
};
export const deleteExpense = async (id) => {
  const res = await axios.delete(`${API_BASE}/expenses/${id}`);
  return res.data;
};
export const settleExpense = async (id) => {
  const res = await axios.put(`${API_BASE}/expenses/${id}/settle`);
  return res.data;
};
export const getRecentExpenses = async (houseId) => {
  const res = await axios.get(`${API_BASE}/expenses/house/${houseId}/recent`);
  return res.data;
};
export const getMonthlySummary = async (houseId) => {
  const res = await axios.get(`${API_BASE}/expenses/house/${houseId}/monthly-summary`);
  return res.data;
};
export const getBalanceSheet = async (houseId) => {
  const res = await axios.get(`${API_BASE}/expenses/house/${houseId}/balance-sheet`);
  return res.data;
};

// ========================== 🖼 RECEIPT UPLOAD ==========================
export const uploadReceipt = async (file) => {
  const formData = new FormData();
  formData.append("receipt", file);
  const res = await axios.post(`${API_BASE}/upload/receipt`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ========================== 🩺 UTILITY APIs ==========================
export const getRootAPI = async () => {
  const res = await axios.get(`${API_BASE}/`);
  return res.data;
};
export const getHealthCheck = async () => {
  const res = await axios.get(`${API_BASE}/health`);
  return res.data;
};
