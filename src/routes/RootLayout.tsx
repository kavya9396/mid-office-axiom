import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";

export default function RootLayout() {
    return (
        <>
            <header>
                <Header />
            </header>

            <main>
                <Outlet />
            </main>
        </>
    );
}