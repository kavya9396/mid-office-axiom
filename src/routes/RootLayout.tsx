import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";

export default function RootLayout() {
    return (
        <>
            <header>
                <Header />
            </header>

            <main style={{backgroundColor: "#F0F3F8", minHeight: "90vh"}}>
                <Outlet />
            </main>
        </>
    );
}