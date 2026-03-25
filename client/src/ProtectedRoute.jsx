import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export default function ProtectedRoute() {
  const { authReady, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!authReady) {
    return <div className="center-state">Loading your workspace...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
