import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import moduleRoutes from "../constants/moduleRoutes";

/** Blocks non-admin users from admin-only routes (e.g. direct URL entry). */
export default function RequireAdmin({ children }) {
  const { isAdmin, loading } = useAuth();

  if (loading) return null;

  if (!isAdmin) {
    return <Navigate to={moduleRoutes.HOSPITALITY_RECORDS} replace />;
  }

  return children;
}
