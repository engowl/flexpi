import { Navigate } from "react-router-dom";
import { useSession } from "../../hook/use-session.jsx";
import { Spinner } from "@nextui-org/react";

export default function RouteGuard({ children }) {
  const { isSignedIn, isLoading } = useSession();

  console.log({
    isSignedIn,
    isLoading,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isSignedIn) return <Navigate to={"/login"} />;

  return children;
}
