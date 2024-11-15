import { Link, NavLink } from "react-router-dom";
import { cnm } from "../../utils/utils";

const LINKS = [
  { title: "Library", href: "/library" },
  { title: "Create", href: "/create" },
  { title: "Explore", href: "/explore" },
];

const Navbar = () => {
  return (
    <div className="w-screen flex justify-between items-center py-4 px-10 bg-white">
      <div className="flex gap-4 items-center">
        <Link to={"/"} className="w-24">
          <img
            src="/assets/flexpi-logo.png"
            alt="flexpi-logo"
            className="w-full h-full object-contain"
          />
        </Link>
        <div className="flex gap-2">
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
    </div>
  );
};

export default Navbar;
