import { RouterProvider } from "react-router-dom";
import RootProvider from "./providers/RootProvider";
import { router } from "./router/router";

function App() {
  return (
    <RootProvider>
      <RouterProvider router={router} />
    </RootProvider>
  );
}

export default App;
