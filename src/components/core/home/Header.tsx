import AppIcon from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import { useAuthStore } from "@/store/authStore";
import { Radius, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type Colors = ReturnType<typeof useTheme>["colors"];

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const Header = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const user = useAuthStore((state) => state.user);

  const name = user?.name?.trim() || "Student";
  const initial = name[0].toUpperCase();

  return (
    <View style={styles.header}>
      <View
        style={styles.userRow}
      >
        <View style={styles.avatar}>
          <AppText variant="cardTitle" style={styles.avatarText}>
            {initial}
          </AppText>
        </View>
        <View style={styles.userText}>
          <AppText variant="small" style={styles.greeting}>
            {greeting()}
          </AppText>
          <AppText variant="title" style={styles.name} numberOfLines={1}>
            {name}
          </AppText>
        </View>
      </View>

      <View>
        {/* TODO: navigate to notifications once that route exists */}
        <TouchableOpacity style={styles.bell}>
          <AppIcon name="Bell" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: Spacing.md,
      marginBottom: Spacing.xxl,
    },
    userRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
    },
    userText: { flex: 1 },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: Radius.full,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { color: colors.onPrimary },
    greeting: { color: colors.textSecondary },
    name: { color: colors.text },
    bell: {
      width: 40,
      height: 40,
      borderRadius: Radius.full,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
  });
