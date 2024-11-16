import ApiKey from "../components/library/ApiKey.jsx";
import Library from "../components/library/library.jsx";
import Experimental from "../components/shared/Experimental.jsx";

export default function IndexPage() {
  return (
    <main className="min-h-screen flex flex-col gap-10 pt-32 pb-20 px-5 md:px-10 bg-[#F2F2F2] overflow-hidden">
      <ApiKey />
      <Library />
      {/* <Experimental /> */}
    </main>
  );
}
