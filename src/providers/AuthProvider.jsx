import { createContext } from "react";
import { flexpiPublicAPI } from "../api/flexpi.js";
import { isSignedInAtom } from "../store/auth-store.js";
import { useAtom } from "jotai";

const AuthContext = createContext({
  userData: {},
});

export default function AuthProvider({ children }) {
  const { handleLogOut, user, primaryWallet } = useDynamicContext();
  const [isReadyToSign, setIsReadyToSign] = useState(false);
  const [isSigningIn, setSigningIn] = useState(false);
  const [, setSignedIn] = useAtom(isSignedInAtom);

  const { isSignedIn, isLoading } = useSession();

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

      const { data } = await flexpiPublicAPI.post("/auth/login", {
        token: dynamicToken,
      });

      localStorage.setItem("access_token", data.token);

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
    }
  };

  useEffect(() => {
    if (isSignedIn || isLoading) return;
    if (isReadyToSign && user) {
      login(user);
    }
  }, [isReadyToSign, isSignedIn, isLoading, user]);

  useEffect(() => {
    if (user && isLoaded) {
      console.log("is ready to sign");
      setIsReadyToSign(true);
    }
  }, [user, isLoaded]);

  useEffect(() => {
    if (userData) {
      if (userData.username === "") {
        setOpen(true);
      }
    }
  }, [userData]);

  return (
    <AuthContext.Provider
      value={{
        userData: userData || {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
