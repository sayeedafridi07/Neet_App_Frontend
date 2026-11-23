import { useCallback, useState } from "react";

/**
 * Pull-to-refresh state that only reflects a user pull.
 *
 * Don't pass React Query's `isRefetching` to `refreshing`: it's also true for
 * background refetches (invalidation, focus, reconnect). Toggling iOS's
 * RefreshControl while the screen is hidden leaves the spinner stuck.
 */
export function usePullToRefresh(refetch: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return { refreshing, onRefresh };
}
