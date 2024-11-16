import { Outlet } from "react-router-dom";
import AuthProvider from "../providers/AuthProvider.jsx";
import Navbar from "../components/shared/Navbar.jsx";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Navbar />
      <Outlet />
    </AuthProvider>
  );
}
