import { Outlet } from "react-router-dom";
import Navbar from "../components/shared/Navbar";

export default function RootLayout() {
  return (
    <div className="min-h-[100svh] bg-[#f2f2f2]">
      <Navbar />
      <Outlet />
    </div>
  );
}
