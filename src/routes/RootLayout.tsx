import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
// import QuickLinks from "../modules/DRS/QuickLinks";

export default function RootLayout() {
    // const { pathname } = useLocation();
    // const isInboxPage = pathname === "/inbox";
    // const isLoginPage = pathname === "/login";
    // const isMainDrsPage = /\/[^/]+\/app\/[^/]+\/drs$/.test(pathname);
    // const shouldShowQuickLinks = !isInboxPage && !isLoginPage && !isMainDrsPage;

    return (
        <>
            <header>
                <Header />
            </header>

            <main style={{backgroundColor: "#F0F3F8", minHeight: "calc(100dvh - 57px)"}}>
                <Outlet />
                {/* {shouldShowQuickLinks && <QuickLinks />} */}
            </main>
        </>
    );
}