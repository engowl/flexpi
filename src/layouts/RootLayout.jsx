import { Outlet } from "react-router-dom";
import AuthProvider from "../providers/AuthProvider.jsx";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
