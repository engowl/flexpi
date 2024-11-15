import { Outlet } from "react-router-dom";
import AuthProvider from "../providers/AuthProvider.jsx";
import GetStartedDialog from "../components/dialogs/GetStartedDialog.jsx";

export default function RootLayout() {
  return (
    <AuthProvider>
      <GetStartedDialog />
      <Outlet />
    </AuthProvider>
  );
}
