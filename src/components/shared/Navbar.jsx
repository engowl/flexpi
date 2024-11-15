import { Link, NavLink, useLocation } from "react-router-dom";
import { cnm, shortenAddress } from "../../utils/style.js";
import { useSession } from "../../hook/use-session.jsx";
import {
  DynamicUserProfile,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import Nounsies from "./Nounsies.jsx";
import { useUser } from "../../providers/UserProvider.jsx";

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
      <div className="fixed z-50 top-0 w-screen flex justify-between items-center py-3 px-5 md:px-10 bg-white">
        <div className="flex gap-10 items-center">
          <Link to={"/"} className="w-16 md:w-24">
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
    )
  );
};

const UserProfileButton = () => {
  const { setShowDynamicUserProfile } = useDynamicContext();
  const { primaryWallet } = useDynamicContext();
  const { userData } = useUser();

  return (
    <div className={"relative flex flex-col"}>
      {primaryWallet && (
        <div className="flex flex-row items-center justify-center gap-4">
          <div className="px-5 py-3 bg-[#F2F2F2] text-sm rounded-lg">
            {userData.apiCredits} Credits
          </div>
          <h1 className="text-sm hidden md:block">
            {shortenAddress(primaryWallet?.address)}
          </h1>
          <button
            onClick={() => setShowDynamicUserProfile(true)}
            className="size-12 rounded-full overflow-hidden relative border-[4px] border-primary"
          >
            <Nounsies address={primaryWallet?.address} />
          </button>
        </div>
      )}

      <DynamicUserProfile variant={"dropdown"} />
    </div>
  );
};

export default Navbar;
