import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { isSignedInAtom } from "../store/auth-store.js";
import { useAtom } from "jotai";

export default function DynamicProvider({ children }) {
  const [, setSignedIn] = useAtom(isSignedInAtom);

  return (
    <DynamicContextProvider
      settings={{
        environmentId: import.meta.env.VITE_DYNAMIC_ENV_ID,
        walletConnectors: [EthereumWalletConnectors],
        displaySiweStatement: true,
        siweStatement: "Sign in with Flexpi",
        initialAuthenticationMode: "connect-and-sign",
        events: {
          onLogout: (args) => {
            setSignedIn(false);
            window.location.reload();
          },
        },
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
