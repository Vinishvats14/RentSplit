import { useState, useEffect } from "react";
import { getProfile, logoutUser } from "../api";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔄 AuthProvider mounted - fetching profile");
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      console.log("📡 Calling /users/me...");
      const response = await getProfile();
      console.log("✅ Profile response:", response);

      // ✅ Backend directly user object bhej raha hai
      setUser(response || null);
    } catch (error) {
      console.error("❌ Failed to fetch profile:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    await fetchProfile(); // ✅ Fetch user after login
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
