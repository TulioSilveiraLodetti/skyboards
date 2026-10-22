import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuth, isAdmin } = useAuth();
  const loc = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: loc.pathname + loc.search }} replace />;
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
}
