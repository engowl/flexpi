import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { isDynamicSigningInAtom, isSignedInAtom } from "../store/auth-store";
import { useAtom } from "jotai";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useAuth } from "../providers/AuthProvider.jsx";

export const useSession = () => {
  const { handleLogOut } = useDynamicContext();
  const { isSigningIn } = useAuth();
  const isLoggedIn = useIsLoggedIn();
  const [isSignedIn, setSignedIn] = useAtom(isSignedInAtom);
  const [isDynamicSigningIn] = useAtom(isDynamicSigningInAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [access_token] = useLocalStorage("access_token", null);

  useEffect(() => {
    if (isLoggedIn && access_token) {
      setSignedIn(true);
    } else if (!isDynamicSigningIn && isLoggedIn && !access_token) {
      handleLogOut();
    }

    setIsLoading(false);
  }, [isSigningIn, isLoggedIn, access_token]);

  return {
    isSignedIn,
    isLoading,
  };
};
