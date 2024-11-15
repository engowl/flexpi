import { createBrowserRouter } from "react-router-dom";
import IndexPage from "../pages/IndexPage.jsx";
import RootLayout from "../layouts/RootLayout.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import CreatePage from "../pages/CreatePage.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout key90 />,
    children: [
      {
        path: "/",
        element: <IndexPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "create",
        element: <CreatePage />
      }
    ],
  },
]);
