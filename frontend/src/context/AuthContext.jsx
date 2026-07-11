import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../api/auth";
import { addNotification } from "../utils/notifications";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    getMe()
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("token")) 
      .finally(() => setLoading(false));
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
    addNotification(userData.email, "Security", "Successful Login 🔐", `You logged in successfully.`);
  };

  const logout = () => {
    if (user) {
      addNotification(user.email, "Security", "Logged Out 🔏", `Your session ended successfully.`);
    }
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
