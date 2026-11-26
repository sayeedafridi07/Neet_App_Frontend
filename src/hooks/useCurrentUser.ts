import { getMe } from "@/api/user.api";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export const CURRENT_USER_KEY = ["user", "me"] as const;

export const useCurrentUser = () => {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  const query = useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: getMe,
    enabled: !!token,
  });

  const fetchedUser = query.data?.data;

  useEffect(() => {
    if (fetchedUser) setUser(fetchedUser);
  }, [fetchedUser, setUser]);

  return query;
};

/** Premium flag from the persisted store (available instantly on launch). */
export const useIsPremium = () => useAuthStore((s) => !!s.user?.isPremium);
