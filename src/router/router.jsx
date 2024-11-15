import { createBrowserRouter } from "react-router-dom";
import IndexPage from "../pages/IndexPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import RootLayout from "../layouts/RootLayout.jsx";
import RouteGuard from "../components/guard/RouteGuard.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: (
          <RouteGuard>
            <IndexPage />
          </RouteGuard>
        ),
      },
      {
        path: "login",
        element: <LoginPage />,
      },
    ],
  },
]);
