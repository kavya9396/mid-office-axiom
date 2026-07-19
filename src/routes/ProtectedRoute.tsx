import { Navigate, Outlet, useLocation } from "react-router-dom";
import { auth } from "../utils/auth";
import SessionTimeout from "../components/layout/SessionTimeout";

export default function ProtectedRoute() {
  const location = useLocation();

  if (!auth.isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return (
    <SessionTimeout>
      <Outlet />
    </SessionTimeout>
  );
}