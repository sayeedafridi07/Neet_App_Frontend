import { Radius, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { AppText } from "./AppText";

export type AppInputProps = TextInputProps & {
  /**
   * Optional label displayed above the input.
   */
  label?: string;

  /**
   * Optional error message displayed below the input.
   */
  error?: string;

  /**
   * Optional icon or component displayed on the left side.
   */
  leftIcon?: React.ReactNode;

  /**
   * Optional icon or component displayed on the right side.
   */
  rightIcon?: React.ReactNode;

  /**
   * Optional style override for the outer container, e.g. to use
   * `flex: 1` when placed alongside other elements in a row.
   */
  containerStyle?: StyleProp<ViewStyle>;
};

export function AppInput({
  style,
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  ...rest
}: AppInputProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <AppText variant="smallBold" style={styles.label}>
          {label}
        </AppText>
      )}

      <View style={[styles.wrapper, error && styles.errorWrapper]}>
        {leftIcon}

        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
          {...rest}
        />

        {rightIcon}
      </View>

      {error && (
        <AppText variant="small" style={styles.error}>
          {error}
        </AppText>
      )}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: {
      width: "100%",
    },

    label: {
      marginBottom: Spacing.sm,
      color: colors.text,
    },

    wrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.md,
      backgroundColor: colors.background,
      paddingHorizontal: Spacing.md,
      minHeight: Spacing.input,
    },

    input: {
      flex: 1,
      color: colors.text,
    },

    errorWrapper: {
      borderColor: colors.error,
    },

    error: {
      marginTop: Spacing.xs,
      color: colors.error,
    },
  });
