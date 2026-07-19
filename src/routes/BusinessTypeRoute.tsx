import { Navigate, Outlet, useParams } from "react-router-dom";
import { normalizeBusinessType } from "./routes";

export default function BusinessTypeRoute() {
  const { businessType } = useParams();

  if (!normalizeBusinessType(businessType)) {
    return (
      <Navigate to="/inbox" replace />
    );
  }

  return <Outlet />;
}