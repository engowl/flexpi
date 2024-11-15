import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { isSignedInAtom } from "../store/auth-store";
import { useAtom } from "jotai";

export const useSession = () => {
  const isLoggedIn = useIsLoggedIn();
  const [isSignedIn, setSignedIn] = useAtom(isSignedInAtom);
  const [isLoading, setIsLoading] = useState(false);

  const access_token = localStorage.getItem("access_token");

  useEffect(() => {
    let timeout;
    if (isLoggedIn && access_token) {
      setIsLoading(true);
      setSignedIn(true);
      timeout = setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [isLoggedIn, access_token]);

  return {
    isSignedIn,
    isLoading,
  };
};
