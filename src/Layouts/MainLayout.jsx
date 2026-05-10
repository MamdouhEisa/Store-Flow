import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { useAuth } from "../auth/AuthContext";

function formatRoleLabel(role) {
  const normalized = String(role || "employee")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");

  if (!normalized) return "Employee";
  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function MainLayout() {
  const { role } = useAuth();
  const roleLabel = formatRoleLabel(role);

  const handleRoleButtonClick = () => {
    window.alert(`Current role: ${roleLabel}`);
  };

  return (
    <div className="container w-full m-auto">
      <Navbar
        showAdmin
        adminLabel={roleLabel}
        onAdminClick={handleRoleButtonClick}
      />
      <Outlet />
    </div>
  );
}
