/**
 * For lazy loading pages that has heavy lib and not visible on initial load
 */

import { lazy } from "react";
import LazyLoader from "../components/utils/LazyLoader";

export const LoginPageLazy = LazyLoader(
  lazy(() => import("../pages/LoginPage"))
);
