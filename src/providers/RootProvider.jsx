import { NextUIProvider } from "@nextui-org/react";

/**
 * NOTE
 * This provider wrapper doesn't have any access to any routing hooks
 */
export default function RootProvider({ children }) {
  return <NextUIProvider>{children}</NextUIProvider>;
}
