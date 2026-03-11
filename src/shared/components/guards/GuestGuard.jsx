import { Navigate, Outlet } from "react-router-dom";

const GuestGuard = () => {
  const token = localStorage.getItem("admin_token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default GuestGuard;
