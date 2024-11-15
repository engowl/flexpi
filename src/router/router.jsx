import { createBrowserRouter } from "react-router-dom";
import IndexPage from "../pages/IndexPage.jsx";
import RootLayout from "../layouts/RootLayout.js";
import { LoginPageLazy } from "./pages.js";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <IndexPage />,
      },
      {
        path: "login",
        element: <LoginPageLazy />,
      },
    ],
  },
]);
