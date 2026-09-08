import { AppText } from "@/components/ui/AppText";
import { useAuthStore } from "@/store/authStore";
import { Radius, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import type { LucideIcon } from "lucide-react-native";
import { ChevronRight, LogOut, MessageCircleMore } from "lucide-react-native";
import { Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Colors = ReturnType<typeof useTheme>["colors"];

type MenuItem = {
  key: string;
  icon: LucideIcon;
  title: string;
  isDestructive?: boolean;
  onPress: () => void;
};

const ProfileScreen = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { user, logout } = useAuthStore((state) => state);

  const menuItems: MenuItem[] = [
    {
      key: "contact-us",
      icon: MessageCircleMore,
      title: "Contact Us",
      onPress: () => {
        Linking.openURL("https://wa.me/917860754573");
      },
    },
    {
      key: "logout",
      icon: LogOut,
      title: "Logout",
      isDestructive: true,
      onPress: () => {
        logout();
      },
    },
  ];

  const initial = user?.name?.trim()?.[0]?.toUpperCase() ?? "?";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <AppText variant="title" style={styles.avatarText}>
              {initial}
            </AppText>
          </View>
          <AppText variant="subtitle" style={styles.name}>
            {user?.name ?? "Student"}
          </AppText>
          {user?.phone && (
            <AppText variant="small" style={styles.phone}>
              {user.phone}
            </AppText>
          )}
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <Pressable
              key={item.key}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.menuItem,
                index !== menuItems.length - 1 && styles.menuItemBorder,
                pressed && styles.menuItemPressed,
              ]}
            >
              <View style={styles.menuItemLeft}>
                <item.icon
                  size={20}
                  color={item.isDestructive ? colors.error : colors.text}
                />
                <AppText
                  variant="default"
                  style={[
                    styles.menuItemText,
                    item.isDestructive && styles.destructiveText,
                  ]}
                >
                  {item.title}
                </AppText>
              </View>
              {!item.isDestructive && (
                <ChevronRight size={18} color={colors.textMuted} />
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.section,
      gap: Spacing.xxl,
    },

    profileSection: {
      alignItems: "center",
      gap: Spacing.xs,
    },

    avatar: {
      width: 72,
      height: 72,
      borderRadius: Radius.full,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: Spacing.sm,
    },

    avatarText: {
      color: colors.onPrimary,
    },

    name: {
      color: colors.text,
    },

    phone: {
      color: colors.textSecondary,
    },

    menuSection: {
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },

    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
    },

    menuItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    menuItemPressed: {
      opacity: 0.7,
    },

    menuItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
    },

    menuItemText: {
      color: colors.text,
    },

    destructiveText: {
      color: colors.error,
    },
  });

export default ProfileScreen;
