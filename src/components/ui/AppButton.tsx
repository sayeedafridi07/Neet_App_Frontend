import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";

import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
} from "react-native";

export type AppButtonProps = PressableProps & {
  /**
   * primary
   * Use for the main/primary action on a screen.
   *
   * secondary
   * Use for secondary actions that are less prominent than the primary action.
   *
   * outline
   * Use for secondary actions where a bordered button is preferred.
   *
   * ghost
   * Use for low-emphasis actions where a background or border is not needed.
   *
   * danger
   * Use for destructive actions such as delete, remove, or cancel subscription.
   */
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";

  /**
   * small
   * Use for compact actions, such as actions inside cards or lists.
   *
   * medium
   * Use for most buttons throughout the application.
   *
   * large
   * Use for prominent actions such as login, signup, or main CTA buttons.
   */
  size?: "small" | "medium" | "large";

  /**
   * Shows a loading indicator and prevents interaction while loading.
   */
  loading?: boolean;

  children?: ReactNode;
};

export function AppButton({
  style,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  children,
  ...rest
}: AppButtonProps) {
  const { colors } = useTheme();

  const styles = createStyles(colors);

  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={(state) => [
        styles.base,
        styles.variants[variant],
        styles.sizes[size],
        state.pressed && styles.pressed,
        isDisabled && styles.disabled,
        typeof style === "function" ? style(state) : style,
      ]}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getLoaderColor(colors, variant)}
        />
      ) : (
        <AppText variant="smallBold" style={styles.texts[variant]}>
          {children}
        </AppText>
      )}
    </Pressable>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    base: {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: Radius.full,
    },

    pressed: {
      opacity: 0.8,
    },

    disabled: {
      opacity: 0.5,
    },

    variants: {
      primary: {
        backgroundColor: colors.primary,
      },

      secondary: {
        backgroundColor: colors.surface,
      },

      outline: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: colors.primary,
      },

      ghost: {
        backgroundColor: "transparent",
      },

      danger: {
        backgroundColor: colors.error,
      },
    },

    sizes: {
      small: {
        minHeight: 36,
        paddingHorizontal: Spacing.md,
      },

      medium: {
        minHeight: 44,
        paddingHorizontal: Spacing.lg,
      },

      large: {
        minHeight: 52,
        paddingHorizontal: Spacing.xl,
      },
    },

    texts: {
      primary: {
        color: colors.onPrimary,
      },

      secondary: {
        color: colors.text,
      },

      outline: {
        color: colors.primary,
      },

      ghost: {
        color: colors.primary,
      },

      danger: {
        color: colors.onPrimary,
      },
    },
  });

function getLoaderColor(
  colors: ReturnType<typeof useTheme>["colors"],
  variant: AppButtonProps["variant"],
) {
  switch (variant) {
    case "primary":
    case "danger":
      return colors.onPrimary;

    default:
      return colors.primary;
  }
}
