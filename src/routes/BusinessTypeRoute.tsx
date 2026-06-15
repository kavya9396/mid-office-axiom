import { Navigate, Outlet, useParams } from "react-router-dom";

const VALID = ["retail", "group"];

export default function BusinessTypeRoute() {
  const { businessType } = useParams();

  if (!VALID.includes(businessType || "")) {
    return (
      <Navigate to="/retail/inbox" replace />
    );
  }

  return <Outlet />;
}