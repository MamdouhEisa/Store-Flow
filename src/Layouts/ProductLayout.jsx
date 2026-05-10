import { Outlet } from "react-router-dom";

export default function ProductLayout() {
  return (
    <div className="min-h-screen ">
      <Outlet />
    </div>
  );
}
