import { NextUIProvider } from "@nextui-org/react";
import DynamicProvider from "./DynamicProvider.jsx";
import { Toaster } from "react-hot-toast";

/**
 * NOTE
 * This provider wrapper doesn't have any access to any routing hooks
 */
export default function RootProvider({ children }) {
  return (
    <DynamicProvider>
      <NextUIProvider>
        {children}
        <Toaster />
      </NextUIProvider>
    </DynamicProvider>
  );
}
