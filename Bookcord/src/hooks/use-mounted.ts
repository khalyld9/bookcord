import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * False while the server (and the first hydration pass) renders, true after
 * mount. Uses `useSyncExternalStore` rather than `useEffect` + `setState` so
 * the value settles without a second render pass of its own.
 */
export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
