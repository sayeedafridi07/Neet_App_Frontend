import { createMMKV } from "react-native-mmkv";

export const mmkv = createMMKV();

export const zustandStorage = {
  setItem: (name: string, value: string) => {
    mmkv.set(name, value);
  },

  getItem: (name: string): string | null => {
    return mmkv.getString(name) ?? null;
  },

  removeItem: (name: string) => {
    mmkv.remove(name);
  },
};
