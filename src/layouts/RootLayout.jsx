import { Outlet } from "react-router-dom";
import AuthProvider from "../providers/AuthProvider.jsx";
import GetStartedDialog from "../components/dialogs/GetStartedDialog.jsx";
import UserProvider from "../providers/UserProvider.jsx";
import Navbar from "../components/shared/Navbar.jsx";
import { Toaster } from "react-hot-toast";

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <Toaster />
        <GetStartedDialog />
        <Navbar />
        <Outlet />
      </UserProvider>
    </AuthProvider>
  );
}
