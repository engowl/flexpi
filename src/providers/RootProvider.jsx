import { NextUIProvider } from "@nextui-org/react";
import DynamicProvider from "./DynamicProvider.jsx";
import AuthProvider from "./AuthProvider.jsx";

/**
 * NOTE
 * This provider wrapper doesn't have any access to any routing hooks
 */
export default function RootProvider({ children }) {
  return (
    <DynamicProvider>
      <AuthProvider>
        <NextUIProvider>{children}</NextUIProvider>
      </AuthProvider>
    </DynamicProvider>
  );
}
