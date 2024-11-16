import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "../hook/use-session.jsx";
import { useAuth } from "./AuthProvider.jsx";
import { useListenEvent } from "../hook/use-event.jsx";
import { flexpiAPI } from "../api/flexpi.js";
import toast from "react-hot-toast";

const UserContext = createContext({
  library: [],
  userData: {},
  apiStats: {
    apiKey: null,
    apiKeyMaxLimit: 0,
    apiKeyCurrentUsage: 0,
  },
});

export default function UserProvider({ children }) {
  const { isSignedIn } = useSession();
  const { userData } = useAuth();
  const [library, setLibrary] = useState([]);
  const [isLibariesLoading, setLibraryLoading] = useState(false);
  const [isApiStatsLoading, setApiStatsLoading] = useState(false);
  const [apiStats, setApiStats] = useState({
    apiKey: null,
    apiKeyMaxLimit: 0,
    apiKeyCurrentUsage: 0,
  });

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

  const fetchApiStats = async () => {
    if (isApiStatsLoading) return;

    setApiStatsLoading(true);
    try {
      const res = await flexpiAPI.get(`/api/stats`);

      if (res.data.data.apiKey) {
        setApiStats(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching api stats", error);
      toast.error("Error fetching api stats");
    } finally {
      setApiStatsLoading(false);
    }
  };

  useListenEvent("create-api-key-dialog", () => {
    fetchLibaries();
    fetchApiStats();
  });

  useEffect(() => {
    if (isSignedIn) {
      fetchLibaries();
      fetchApiStats();
    }
  }, [isSignedIn, userData]);

  return (
    <UserContext.Provider
      value={{
        userData: userData,
        library: library,
        apiStats: apiStats,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  return useContext(UserContext);
};
