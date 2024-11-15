import { DynamicEmbeddedWidget } from "@dynamic-labs/sdk-react-core";
import AsciiFlame from "../components/shared/AsciiFlame.jsx";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center px-5 md:px-10 bg-primary-50">
      <AsciiFlame />

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-4">
          <img src="/assets/flexpi-logo.png" className="w-36" />
        </div>

        <DynamicEmbeddedWidget background="with-border" />

        <div className="flex flex-col items-center mt-2">
          <div className="mt-8 opacity-60">Powered by</div>
          <div className="mt-1">
            <img src="/assets/oasis-long-logo.svg" className="w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
