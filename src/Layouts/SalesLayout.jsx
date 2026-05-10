import { Outlet } from "react-router-dom";

export default function SalesLayout() {
  return (
    <div className="min-h-screen ">
      <Outlet />
    </div>
  );
}
