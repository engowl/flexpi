import { createContext, useContext, useEffect, useState } from "react";
import { flexpiPublicAPI } from "../api/flexpi.js";
import { isDynamicSigningInAtom, isSignedInAtom } from "../store/auth-store.js";
import { useAtom } from "jotai";
import { getAuthToken, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useSession } from "../hook/use-session.jsx";
import toast from "react-hot-toast";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext({
  userData: {},
  isSigningIn: false,
  isNewUser: false,
});

export default function AuthProvider({ children }) {
  const { handleLogOut, user, primaryWallet } = useDynamicContext();
  const [isReadyToSign, setIsReadyToSign] = useState(false);
  const [isSigningIn, setSigningIn] = useState(false);
  const [, setSignedIn] = useAtom(isSignedInAtom);
  const [, setIsDynamicSigningIn] = useAtom(isDynamicSigningInAtom);
  const { isSignedIn, isLoading } = useSession();
  const [, setAccessToken] = useLocalStorage("access_token");
  const [isNewUser, setIsNewUser] = useState(false);

  const navigate = useNavigate();

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
      const dynamicToken = getAuthToken();

      const { data } = await flexpiPublicAPI.post("/auth/login", {
        token: dynamicToken,
        address: primaryWallet.address,
        walletType: primaryWallet.key !== "turnkeyhd" ? "EOA" : "SOCIAL",
      });

      const token = data.data.access_token;

      if (!token) {
        throw new Error("Token not found");
      }

      setAccessToken(token);
      setIsNewUser(data.data.isNewUser);
      navigate("/");
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
        isNewUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};