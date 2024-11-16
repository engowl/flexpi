import { createBrowserRouter } from "react-router-dom";
import IndexPage from "../pages/IndexPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import RootLayout from "../layouts/RootLayout.jsx";
import RouteGuard from "../components/guard/RouteGuard.jsx";
import RouteAuthLoginGuard from "../components/guard/RouteLoginGuard.jsx";
import CreatePage from "../pages/CreatePage.jsx";
import ExplorePage from "../pages/ExplorePage.jsx";
import HistoryPage from "../pages/HistoryPage.jsx";

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
        element: (
          <RouteAuthLoginGuard>
            <LoginPage />
          </RouteAuthLoginGuard>
        ),
      },
      {
        path: "create",
        element: (
          <RouteGuard>
            <CreatePage />
          </RouteGuard>
        ),
      },
      {
        path: "explore",
        element: (
          <RouteGuard>
            <ExplorePage />
          </RouteGuard>
        ),
      },
      {
        path: 'history',
        element: (
          <RouteGuard>
            <HistoryPage />
          </RouteGuard>
        )
      }
    ],
  },
]);
