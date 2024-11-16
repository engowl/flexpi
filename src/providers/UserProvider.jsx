import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "../hook/use-session.jsx";
import { useAuth } from "./AuthProvider.jsx";
import { useListenEvent } from "../hook/use-event.jsx";
import { flexpiAPI } from "../api/flexpi.js";
import toast from "react-hot-toast";

const UserContext = createContext({
  library: [],
  userData: {},
});

export default function UserProvider({ children }) {
  const { isSignedIn } = useSession();
  const { userData } = useAuth();
  const [library, setLibrary] = useState([]);
  const [isLibariesLoading, setLibraryLoading] = useState(false);

  const fetchLibaries = async () => {
    if (isLibariesLoading) return;
    setLibraryLoading(true);
    try {
      //TODO: implement with actual api
      //   const res = await flexpiAPI.get(`/user/library`);
      //   setLibrary(res.data);
      setLibrary([]);
    } catch (error) {
      console.error("Error fetching user library", error);
      toast.error("Error fetching user library");
    } finally {
      setLibraryLoading(false);
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
        library: library,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  return useContext(UserContext);
};
