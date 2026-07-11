import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wraps any route that requires a logged-in user, e.g.:
//   <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
// Pass `role="admin"` to also require a specific role:
//   <Route path="/admin" element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />
// Renders nothing while the initial session check is still running,
// so a logged-in user never sees a flash of the login page on
// refresh, then redirects to /login once we know for sure there's no
// user, or to /dashboard if they're logged in but lack the role.
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;

  return children;
};

export default ProtectedRoute;
