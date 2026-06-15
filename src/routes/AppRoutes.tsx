import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../modules/Login/Login";
import ProtectedRoute from "./ProtectedRoute";
import BusinessTypeRoute from "./BusinessTypeRoute";
import RootLayout from "./RootLayout";
import Inbox from "../modules/Landing/Inbox";
import { PATHS } from "./paths";

function BusinessTypeRedirect() {
    return <Navigate to="inbox" replace />;
}

export default function AppRoutes() {
    return (
        <Routes>
            {/* PUBLIC */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* PROTECTED */}
            <Route element={<ProtectedRoute />}>
                <Route element={<BusinessTypeRoute />}>

                    {/* REDIRECT BASE BUSINESS TYPE */}
                    <Route path=":businessType" element={<BusinessTypeRedirect />} />

                    {/* APP ROUTES WITH LAYOUT */}
                    <Route path=":businessType" element={<RootLayout />}>

                        <Route path={PATHS.INBOX} element={<Inbox />} />

                    </Route>
                </Route>
            </Route>

            {/* FALLBACK */}
            <Route path="*" element={<div>Not Found</div>} />
        </Routes>
    );
}