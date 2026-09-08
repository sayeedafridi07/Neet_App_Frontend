import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import { useThemedStyles } from "@/theme/use-themed-styles";
import { router } from "expo-router";
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import AppIcon from "./AppIcon";

interface AppTopBarProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const AppTopBar = ({
  title,
  showBack = true,
  onBackPress,
  rightAction,
  style,
}: AppTopBarProps) => {
  const { colors } = useTheme();
  const styles = useThemedStyles((colors) =>
    StyleSheet.create({
      container: {
        height: 56,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: Spacing.md,
        backgroundColor: colors.background,
      },

      side: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
      },

      btn: {
        width: 40,
        height: 40,
        borderRadius: Radius.full,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primary,
      },

      titleContainer: {
        flex: 1,
        alignItems: "center",
      },

      title: {
        color: colors.text,
      },

      actionContainer: {
        width: 40,
        alignItems: "flex-end",
        justifyContent: "center",
      },
    }),
  );

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }
    router.back();
  };

  return (
    <View style={[styles.container, style]}>
      {/* Left */}
      <View style={styles.side}>
        {showBack && (
          <Pressable onPress={handleBackPress} hitSlop={10} style={styles.btn}>
            <AppIcon name="ChevronLeft" color={colors.onPrimary} />
          </Pressable>
        )}
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <AppText variant="small" style={styles.title}>
          {title}
        </AppText>
      </View>

      {/* Right */}
      <View style={styles.actionContainer}>{rightAction}</View>
    </View>
  );
};

export default AppTopBar;
