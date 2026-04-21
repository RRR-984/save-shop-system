import { r as reactExports } from "./index-CyJThNPE.js";
function useAsyncAction(action) {
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const execute = reactExports.useCallback(
    async (...args) => {
      setIsLoading(true);
      try {
        await action(...args);
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [action]
  );
  return { execute, isLoading };
}
export {
  useAsyncAction as u
};
