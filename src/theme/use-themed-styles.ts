import { StyleSheet } from "react-native";
import { useTheme } from "./use-theme";

export const useThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  createStyles: (colors: ReturnType<typeof useTheme>["colors"]) => T,
) => {
  const { colors } = useTheme();

  return StyleSheet.create(createStyles(colors));
};
