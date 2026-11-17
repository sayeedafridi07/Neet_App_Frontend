import { Typography } from "@/theme";
import { StyleSheet, Text, type TextProps } from "react-native";

export type AppTextProps = TextProps & {
  variant?: keyof typeof Typography;
};

export function AppText({ style, variant = "default", ...rest }: AppTextProps) {
  return <Text style={[styles[variant], style]} {...rest} />;
}

const styles = StyleSheet.create(Typography);
