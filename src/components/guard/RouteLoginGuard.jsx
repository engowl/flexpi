import { Navigate } from "react-router-dom";
import { useSession } from "../../hook/use-session.jsx";

export default function RouteAuthLoginGuard({ children }) {
  const { isSignedIn, isLoading } = useSession();

  if (isSignedIn && !isLoading) return <Navigate to={"/"} />;

  return children;
}
