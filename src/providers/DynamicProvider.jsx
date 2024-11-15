import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { isDynamicSigningInAtom, isSignedInAtom } from "../store/auth-store.js";
import { useAtom } from "jotai";

export default function DynamicProvider({ children }) {
  const [, setSignedIn] = useAtom(isSignedInAtom);
  const [, setIsDynamicSigningIn] = useAtom(isDynamicSigningInAtom);

  return (
    <DynamicContextProvider
      settings={{
        environmentId: import.meta.env.VITE_DYNAMIC_ENV_ID,
        walletConnectors: [EthereumWalletConnectors],
        displaySiweStatement: true,
        siweStatement: "Sign in with Flexpi",
        initialAuthenticationMode: "connect-and-sign",
        events: {
          onAuthFlowOpen: () => {
            setIsDynamicSigningIn(true);
          },
          onSignedMessage: ({ signatureHash, signedMessage }) => {
            console.log(
              `onSignedMessage was called: ${signatureHash}, ${signedMessage}`
            );
          },
          onLogout: (args) => {
            setSignedIn(false);
            setIsDynamicSigningIn(false);
            localStorage.removeItem("access_token");
            window.location.reload();
          },
        },
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
