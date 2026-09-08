import { createContext, useEffect, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { Colors } from "@/theme";
import { setSnackbarTheme } from "@/utils/snackbar";

type ThemeName = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeName;
  colors: (typeof Colors)[ThemeName];
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const deviceScheme = useColorScheme();
  const toThemeName = (scheme: typeof deviceScheme): ThemeName =>
    scheme === "dark" ? "dark" : "light";

  const [theme, setTheme] = useState<ThemeName>(toThemeName(deviceScheme));

  useEffect(() => {
    setTheme(toThemeName(deviceScheme));
  }, [deviceScheme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  const colors = Colors[theme];

  useEffect(() => {
    setSnackbarTheme(colors);
  }, [colors]);

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
