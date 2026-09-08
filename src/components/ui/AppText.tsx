import { Typography } from "@/theme";
import { StyleSheet, Text, type TextProps } from "react-native";

export type AppTextProps = TextProps & {
  variant?: "default" | "title" | "small" | "smallBold" | "subtitle" | "link";
};

export function AppText({ style, variant = "default", ...rest }: AppTextProps) {
  return <Text style={[styles[variant], style]} {...rest} />;
}
const styles = StyleSheet.create({
  default: Typography.default,
  title: Typography.title,
  small: Typography.small,
  smallBold: Typography.smallBold,
  subtitle: Typography.subtitle,
  link: Typography.link,
});
