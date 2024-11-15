import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "../hook/use-session.jsx";
import { useAuth } from "./AuthProvider.jsx";
import { useListenEvent } from "../hook/use-event.jsx";
import { flexpiAPI } from "../api/flexpi.js";
import toast from "react-hot-toast";

const UserContext = createContext({
  libraries: [],
  userData: {},
});

export default function UserProvider({ children }) {
  const { isSignedIn } = useSession();
  const { userData } = useAuth();
  const [libraries, setLibraries] = useState([]);
  const [isLibariesLoading, setLibrariesLoading] = useState(false);

  const fetchLibaries = async () => {
    if (isLibariesLoading) return;
    setLibrariesLoading(true);
    try {
      //TODO: implement with actual api
      //   const res = await flexpiAPI.get(`/user/libraries`);
      //   setLibraries(res.data);
      setLibraries([]);
    } catch (error) {
      console.error("Error fetching user libraries", error);
      toast.error("Error fetching user libraries");
    } finally {
      setLibrariesLoading(false);
    }
  };

  useListenEvent("create-api-key-dialog", () => {
    fetchLibaries();
  });

  useEffect(() => {
    if (isSignedIn) {
      fetchLibaries();
    }
  }, [isSignedIn, userData]);

  return (
    <UserContext.Provider
      value={{
        userData: userData,
        libraries: libraries,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  return useContext(UserContext);
};
