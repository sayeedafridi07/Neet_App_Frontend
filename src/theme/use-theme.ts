// import { useContext } from "react";
// import { ThemeContext } from "./ThemeProvider";
// export const useTheme = () => useContext(ThemeContext);

import { Colors } from "@/theme";
import { useColorScheme } from "react-native";

export function useTheme() {
  const scheme = useColorScheme();
  const theme = scheme === "unspecified" ? "light" : scheme;

  const colors = Colors[theme];

  return { theme, colors };
}
