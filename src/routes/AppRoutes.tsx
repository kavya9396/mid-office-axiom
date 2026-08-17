import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../modules/Login/Login";
import ProtectedRoute from "./ProtectedRoute";
import BusinessTypeRoute from "./BusinessTypeRoute";
import RootLayout from "./RootLayout";
import { PATHS } from "./paths";

import DRS from "../modules/DRS/DRS";
import ViewFinancial from "../modules/DRS/Financial/ViewFinancial";
import ViewMedical from "../modules/DRS/Medical Final/ViewMedical";
import Grievance from "../modules/Grievance/Grievance";
import GrievanceApplication from "../modules/Grievance/GrievanceApplication";
import PreviousPolicy from "../modules/QuickLinks/PreviousPolicy";
import AuditTrailPage from "../modules/QuickLinks/AuditTrailPage";
import RiskDetailsPage from "../modules/QuickLinks/RiskDetailsPage";
import OpenTasksPage from "../modules/QuickLinks/OpenTasksPage";
import UserManagement from "../modules/DRS/UserManagement";
import SearchApplication from "../modules/Landing/SearchApplication";
import Inbox from "../modules/Landing/Inbox";
import MasterDataRoute from "../masterDataRoute";

function BusinessTypeRedirect() {
  return <Navigate to={PATHS.INBOX} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* PROTECTED */}
      <Route element={<ProtectedRoute />}>
        {/* Load Redux master data for all protected routes */}
        <Route element={<MasterDataRoute />}>
          {/* Independent Routes */}
          <Route
            path={PATHS.INBOX}
            element={<RootLayout />}
          >
            <Route index element={<Inbox />} />
          </Route>

          <Route
            path={PATHS.USER_MANAGEMENT}
            element={<RootLayout />}
          >
            <Route index element={<UserManagement />} />
          </Route>

          <Route
            path={PATHS.SEARCH_APPLICATION}
            element={<RootLayout />}
          >
            <Route index element={<SearchApplication />} />
          </Route>

          <Route element={<BusinessTypeRoute />}>
            {/* Redirect Base Business Type */}
            <Route
              path=":businessType"
              element={<BusinessTypeRedirect />}
            />

            {/* Application Routes With Layout */}
            <Route
              path=":businessType"
              element={<RootLayout />}
            >
              <Route path={PATHS.DRS} element={<DRS />} />

              <Route
                path={PATHS.DRS_MEDICAL}
                element={<ViewMedical />}
              />

              <Route
                path={PATHS.DRS_FINANCIAL}
                element={<ViewFinancial />}
              />

              <Route
                path={PATHS.DRS_AUDIT_TRAIL}
                element={<AuditTrailPage />}
              />

              <Route
                path={PATHS.DRS_OPEN_TASKS}
                element={<OpenTasksPage />}
              />

              <Route
                path={PATHS.DRS_RISK_DETAILS}
                element={<RiskDetailsPage />}
              />

              <Route
                path={PATHS.GRIEVANCE_RAISE}
                element={<Grievance />}
              />

              <Route
                path={PATHS.GRIEVANCE_APPLICATION}
                element={<GrievanceApplication />}
              />

              <Route
                path={PATHS.DRS_PREVIOUS}
                element={<PreviousPolicy />}
              />
            </Route>
          </Route>
        </Route>
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  );
}