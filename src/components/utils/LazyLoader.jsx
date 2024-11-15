import { Spinner } from "@nextui-org/react";
import { Suspense } from "react";
import { cnm } from "../../utils/style";

const FullSizeLoading = ({ className }) => {
  return (
    <div
      className={cnm(
        "h-full min-h-72 w-full flex items-center justify-center",
        className
      )}
    >
      <Spinner />
    </div>
  );
};

const LazyLoader = (Component, vars) => {
  const LoadableComponent = (props) => {
    return (
      <Suspense
        fallback={<FullSizeLoading className={vars?.loadingClassname} />}
      >
        <Component {...props} />
      </Suspense>
    );
  };

  LoadableComponent.displayName = `Loadable(${
    Component.displayName || Component.name || "Component"
  })`;

  return LoadableComponent;
};

export default LazyLoader;
