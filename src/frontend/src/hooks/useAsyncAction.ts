import { useCallback, useState } from "react";

/**
 * Wraps an async action with loading state.
 * Usage:
 *   const { execute, isLoading } = useAsyncAction(async (args) => { ... });
 */
export function useAsyncAction<T extends unknown[]>(
  action: (...args: T) => Promise<void> | void,
) {
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (...args: T) => {
      setIsLoading(true);
      try {
        await action(...args);
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [action],
  );

  return { execute, isLoading };
}
