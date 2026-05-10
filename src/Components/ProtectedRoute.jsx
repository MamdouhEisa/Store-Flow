import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function normalizeRoleKey(roleValue) {
  return String(roleValue || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function hasAllowedRole(allowedRoles, currentRole) {
  if (!allowedRoles) return true;

  const rolesList = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (rolesList.length === 0) return true;

  return rolesList.some((role) => normalizeRoleKey(role) === normalizeRoleKey(currentRole));
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isReady, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return <div className="min-h-screen bg-gray-100" />;
  }

  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }

  const currentRole = String(user?.role || "").toLowerCase();
  if (!hasAllowedRole(allowedRoles, currentRole)) {
    return <Navigate to="/home" replace state={{ denied: true }} />;
  }

  return children ?? <Outlet />;
}
