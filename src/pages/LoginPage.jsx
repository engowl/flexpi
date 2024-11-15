import { DynamicEmbeddedWidget } from "@dynamic-labs/sdk-react-core";
import AsciiFlame from "../components/shared/AsciiFlame.jsx";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center px-5 md:px-10 overflow-hidden bg-[#F2F2F2]">
      <AsciiFlame />

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <img src="/assets/flexpi-logo.png" className="w-36" />
        </div>

        <DynamicEmbeddedWidget background="with-border" />
      </div>
    </div>
  );
}
