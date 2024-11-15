import { Outlet } from "react-router-dom";
import AuthProvider from "../providers/AuthProvider.jsx";
import GetStartedDialog from "../components/dialogs/GetStartedDialog.jsx";
import UserProvider from "../providers/UserProvider.jsx";

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <GetStartedDialog />
        <Outlet />
      </UserProvider>
    </AuthProvider>
  );
}
