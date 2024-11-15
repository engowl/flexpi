import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { isSignedInAtom } from "../store/auth-store";
import { useAtom } from "jotai";
import { useLocalStorage } from "@uidotdev/usehooks";

export const useSession = () => {
  const isLoggedIn = useIsLoggedIn();
  const [isSignedIn, setSignedIn] = useAtom(isSignedInAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [access_token] = useLocalStorage("access_token", null);

  useEffect(() => {
    if (isLoggedIn && access_token) {
      setIsLoading(false);
      setSignedIn(true);
    }
  }, [isLoggedIn, access_token]);

  return {
    isSignedIn,
    isLoading,
  };
};
