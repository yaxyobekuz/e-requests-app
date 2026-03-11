import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { authAPI } from "@/shared/api";

const AuthGuard = () => {
  const token = localStorage.getItem("admin_token");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!token) { setReady(true); return; }
    authAPI
      .getMe()
      .then(({ data }) => {
        localStorage.setItem("admin_user", JSON.stringify(data));
      })
      .catch(() => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
      })
      .finally(() => setReady(true));
  }, []);

  if (!token) return <Navigate to="/login" replace />;
  if (!ready) return null;

  return <Outlet />;
};

export default AuthGuard;
