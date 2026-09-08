import type { AxiosResponse } from "axios";
import { MutationCache, QueryClient } from "@tanstack/react-query";

import { showToast } from "@/utils/toast";

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => {
      const response = error as unknown as AxiosResponse | undefined;

      showToast({
        type: "error",
        // title: `${response?.status}: ${response?.data?.message}`,
        message: `${response?.status}: ${response?.data?.message}`,
      });
    },
  }),

  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes

      retry: 2,

      refetchOnReconnect: true,
    },

    mutations: {
      retry: 0,
    },
  },
});
