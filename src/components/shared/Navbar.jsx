import { Link, NavLink, useLocation } from "react-router-dom";
import { cnm, shortenAddress } from "../../utils/style.js";
import { useSession } from "../../hook/use-session.jsx";
import {
  DynamicUserProfile,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import Nounsies from "./Nounsies.jsx";
import { useUser } from "../../providers/UserProvider.jsx";
import { Skeleton } from "@nextui-org/react";
import { HistoryIcon } from "lucide-react";

const LINKS = [
  { title: "Library", href: "/" },
  { title: "Create", href: "/create" },
  { title: "Explore", href: "/explore" },
];

const Navbar = () => {
  const { isSignedIn } = useSession();
  const location = useLocation();

  return (
    location.pathname !== "/login" && (
      <div className="fixed top-0 z-50 w-full p-5">
        <div className="flex justify-between items-center px-5 md:px-10 bg-white h-20 w-full rounded-xl drop-shadow-sm">
          <div className="flex gap-10 items-center">
            <Link to={"/"} className="w-16 md:w-20 -mt-4">
              <img
                src="/assets/flexpi-logo.png"
                alt="flexpi-logo"
                className="w-full h-full object-contain"
              />
            </Link>
            <div className="hidden md:flex gap-2 ">
              {LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) =>
                    cnm(
                      "py-2 px-4 rounded-xl w-full flex items-center",
                      isActive
                        ? "text-[#2F7004] stroke-primary bg-[#E6FFD6]"
                        : "text-secondary-800 stroke-secondary-800"
                    )
                  }
                >
                  <p>{link.title}</p>
                </NavLink>
              ))}
            </div>
          </div>
          {isSignedIn && <UserProfileButton />}
        </div>
      </div>
    )
  );
};

const UserProfileButton = () => {
  const { setShowDynamicUserProfile } = useDynamicContext();
  const { primaryWallet } = useDynamicContext();
  const { userData } = useUser();

  return (
    <div className={"relative flex flex-row gap-2"}>
      <NavLink
        key={"history-navigation"}
        to={"/history"}
        className="py-2 px-3 text-sm rounded-lg w-fit bg-[#F2F2F2] hover:bg-[#727272]/20 flex items-center gap-2"
      >
        <HistoryIcon size={14} />
        <p className="hidden md:block">History</p>
      </NavLink>
      {primaryWallet ? (
        <div className="flex flex-row items-center justify-center gap-2">
          <div className="px-5 h-11 bg-[#F2F2F2] text-sm rounded-lg flex items-center justify-center">
            {userData.apiCredits} Credits
          </div>
          <button
            onClick={() => setShowDynamicUserProfile(true)}
            className="px-5 h-11 flex flex-row gap-2 items-center justify-center bg-primary/20 rounded-lg"
          >
            <h1 className="text-sm hidden md:block text-primary-800">
              {shortenAddress(primaryWallet?.address)}
            </h1>
            <div className="size-8 rounded-full overflow-hidden relative">
              <Nounsies address={primaryWallet?.address} />
            </div>
          </button>
        </div>
      ) : (
        <div className="flex flex-row gap-2">
          <Skeleton className="rounded-lg">
            <div className="h-11 w-32 rounded-lg bg-[#F2F2F2]"></div>
          </Skeleton>
          <Skeleton className="rounded-lg">
            <div className="h-11 w-40 rounded-lg bg-[#F2F2F2]"></div>
          </Skeleton>
        </div>
      )}

      <DynamicUserProfile variant={"dropdown"} />
    </div>
  );
};

export default Navbar;
