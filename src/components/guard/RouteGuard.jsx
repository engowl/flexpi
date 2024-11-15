import { Navigate } from "react-router-dom";
import { useSession } from "../../hook/use-session.jsx";

export default function RouteGuard({ children }) {
  const { isSignedIn, isLoading } = useSession();

  if (!isSignedIn) return <Navigate to={"/login"} />;

  return children;
}
