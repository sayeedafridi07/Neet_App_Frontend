import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "../config/storage";

interface User {
  id: string;
  phone: string;
  name: string | null;
  city: string | null;
  schoolName: string | null;
  targetYear: number | null;
  profileComplete: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;

  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      setToken: (token) => set({ token }),

      setUser: (user) => set({ user }),

      logout: () =>
        set({
          token: null,
          user: null,
        }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => zustandStorage),

      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    },
  ),
);
