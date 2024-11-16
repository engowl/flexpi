import { DynamicEmbeddedWidget } from "@dynamic-labs/sdk-react-core";
import AsciiFlame from "../components/shared/AsciiFlame.jsx";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center px-5 md:px-10 overflow-hidden bg-primary/5">
      <AsciiFlame />

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-5 gap-3">
          <img src="/assets/flexpi-logo.png" className="w-36" />
          <p className="font-neuton text-xl text-neutral-500">
            Redefining APIs, Simplifying Data
          </p>
        </div>

        <DynamicEmbeddedWidget background="with-border" />
      </div>
    </div>
  );
}
