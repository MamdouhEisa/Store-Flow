import { Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function PublicRoute({ children }) {
  const { isReady } = useAuth();

  if (!isReady) {
    return <div className="min-h-screen bg-gray-100" />;
  }

  return children ?? <Outlet />;
}
