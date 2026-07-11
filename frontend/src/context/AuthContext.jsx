import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../api/auth";
import { addNotification } from "../utils/notifications";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Starts true because on first load we don't yet know if there's a
  // valid session - ProtectedRoute uses this to avoid flashing the
  // login page for someone who's actually already logged in.
  const [loading, setLoading] = useState(true);

  // On first load, if a token was saved from a previous visit, fetch
  // the matching user so refreshing the page doesn't log people out.
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    getMe()
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("token")) // token expired or invalid
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

// Small hook so components write `const { user } = useAuth()` instead
// of importing both useContext and AuthContext everywhere.
export const useAuth = () => useContext(AuthContext);
