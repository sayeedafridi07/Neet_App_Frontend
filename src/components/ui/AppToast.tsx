import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import { StyleSheet, View } from "react-native";
import type { BaseToastProps } from "react-native-toast-message";

type AppToastType = "success" | "error";

interface AppToastProps extends BaseToastProps {
  type: AppToastType;
}

const AppToast = ({ text1, text2, type }: AppToastProps) => {
  const { colors } = useTheme();

  const styles = createStyles(colors);

  const isSuccess = type === "success";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isSuccess ? colors.success : colors.error,
        },
      ]}
    >
      <View style={styles.icon}>
        <AppText style={styles.iconText}>{isSuccess ? "✓" : "!"}</AppText>
      </View>

      <View style={styles.content}>
        {/* {text1 && (
          <AppText variant="smallBold" style={styles.title}>
            {text1}
          </AppText>
        )} */}

        {text2 && (
          <AppText variant="small" style={styles.message}>
            {text2}
          </AppText>
        )}
      </View>
    </View>
  );
};

export default AppToast;

export const toastConfig = {
  success: (props: BaseToastProps) => <AppToast {...props} type="success" />,

  error: (props: BaseToastProps) => <AppToast {...props} type="error" />,
};

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: {
      width: "60%",
      // marginHorizontal: Spacing.lg,
      borderRadius: Radius.lg,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.xs,
      padding: Spacing.sm,
    },

    icon: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },

    iconText: {
      color: colors.onPrimary,
    },

    content: {
      flex: 1,
    },

    title: {
      color: colors.onPrimary,
    },

    message: {
      color: colors.onPrimary,
    },
  });
