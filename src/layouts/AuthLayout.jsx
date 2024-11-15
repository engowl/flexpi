import { Toaster } from "react-hot-toast";
import AuthProvider from "../providers/AuthProvider.jsx";

export default function AuthLayout() {
  const { isSignedIn } = useSession();

  if (!isSignedIn) {
  }

  return (
    <AuthProvider>
      <Toaster />
      <Outlet />
    </AuthProvider>
  );
}
