import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

function ProtectedRoutes({ children, requiredRole }) {
  const { authData, authLoading } = useAuth();
  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!authData.token) {
    return <Navigate to="/login" replace />;
  }
  if (!authData.user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && authData.user.role !== requiredRole) {
    return <Navigate to="/login" />;
  }

  return children;
}

export { ProtectedRoutes };
