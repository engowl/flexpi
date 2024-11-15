import { createContext, useContext, useEffect, useState } from "react";
import { flexpiPublicAPI } from "../api/flexpi.js";
import { isDynamicSigningInAtom, isSignedInAtom } from "../store/auth-store.js";
import { useAtom } from "jotai";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useSession } from "../hook/use-session.jsx";
import toast from "react-hot-toast";
import { useLocalStorage } from "@uidotdev/usehooks";

const AuthContext = createContext({
  userData: {},
  isSigningIn: false,
});

export default function AuthProvider({ children }) {
  const { handleLogOut, user, primaryWallet } = useDynamicContext();
  const [isReadyToSign, setIsReadyToSign] = useState(false);
  const [isSigningIn, setSigningIn] = useState(false);
  const [, setSignedIn] = useAtom(isSignedInAtom);
  const [, setIsDynamicSigningIn] = useAtom(isDynamicSigningInAtom);
  const { isSignedIn, isLoading } = useSession();
  const [, setAccessToken] = useLocalStorage("access_token");

  //   const { data: userData } = useSWR(
  //     isSignedIn ? "/auth/me" : null,
  //     async (url) => {
  //       const { data } = await flexpiAPI.get(url);
  //       return data;
  //     }
  //   );

  const login = async (user) => {
    if (isSigningIn || !user || !primaryWallet) return;

    setSigningIn(true);

    try {
      const dynamicToken = localStorage.getItem("dynamic_authentication_token");

      //   const { data } = await flexpiPublicAPI.post("/auth/login", {
      //     token: dynamicToken,
      //   });

      setAccessToken("token");

      toast.success("Signed in successfully", {
        id: "signing",
      });
    } catch (e) {
      toast.error("Error signing in", {
        id: "signing",
      });

      setSignedIn(false);

      if (user) {
        console.log("Error while logging in and user is present", e);
        handleLogOut();
      }
      console.error("Error logging in", e);
    } finally {
      setSigningIn(false);
      setIsDynamicSigningIn(false);
    }
  };

  useEffect(() => {
    if (isSignedIn || isLoading) return;
    if (isReadyToSign && user) {
      login(user);
    }
  }, [isReadyToSign, isSignedIn, isLoading, user]);

  useEffect(() => {
    if (user) {
      console.log("is ready to sign");
      setIsReadyToSign(true);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        // userData: userData || {},
        isSigningIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
