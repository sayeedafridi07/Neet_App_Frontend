import Header from "@/components/core/home/Header";
import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import type { LucideIcon } from "lucide-react-native";
import {
  AudioLines,
  BookOpenCheck,
  ChevronRight,
  Headphones,
} from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Colors = ReturnType<typeof useTheme>["colors"];

type MenuItem = {
  key: string;
  icon: LucideIcon;
  iconColor: string;
  iconBackground: string;
  title: string;
  subtitle: string;
};

type Activity = {
  key: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  meta: string;
  metaVariant: "duration" | "score";
};

const HomeScreen = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const menuItems: MenuItem[] = [
    {
      key: "mcq-practice",
      icon: BookOpenCheck,
      iconColor: colors.primary,
      iconBackground: colors.border,
      title: "MCQ Practice",
      subtitle: "Practice chapter-wise questions",
    },
    {
      key: "audio-keywords",
      icon: AudioLines,
      iconColor: colors.primary,
      iconBackground: colors.background,
      title: "Audio Keywords",
      subtitle: "Learn important keywords through audio",
    },

    {
      key: "audio-summary",
      icon: Headphones,
      iconColor: colors.onPrimary,
      iconBackground: colors.primary,
      title: "Audio Summary",
      subtitle: "Listen to chapter-wise summaries",
    },
  ];

  const recentActivity: Activity[] = [
    {
      key: "plant-kingdom",
      icon: Headphones,
      title: "Plant Kingdom",
      subtitle: "Audio Summary • Yesterday",
      meta: "18 mins",
      metaVariant: "duration",
    },
    {
      key: "biomolecules-test",
      icon: BookOpenCheck,
      title: "Biomolecules Test",
      subtitle: "Mock Test • 2 days ago",
      meta: "85%",
      metaVariant: "score",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <AppText variant="subtitle" style={styles.heading}>
          Chalo kro classroom ke bahar ki taiyaari!
        </AppText>

        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <Pressable
              key={item.key}
              style={({ pressed }) => [
                styles.menuCard,
                pressed && styles.menuCardPressed,
              ]}
            >
              <View
                style={[
                  styles.menuIconWrapper,
                  { backgroundColor: item.iconBackground },
                ]}
              >
                <item.icon size={24} color={item.iconColor} />
              </View>

              <View style={styles.menuTextWrapper}>
                <AppText variant="subtitle" style={styles.menuTitle}>
                  {item.title}
                </AppText>
                <AppText variant="small" style={styles.menuSubtitle}>
                  {item.subtitle}
                </AppText>
              </View>

              <ChevronRight size={20} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <AppText variant="subtitle" style={styles.sectionTitle}>
            Recent Activity
          </AppText>
          <Pressable>
            <AppText variant="link" style={styles.seeAll}>
              SEE ALL
            </AppText>
          </Pressable>
        </View>

        <View style={styles.activityList}>
          {recentActivity.map((activity) => (
            <View key={activity.key} style={styles.activityRow}>
              <View style={styles.activityIconWrapper}>
                <activity.icon size={20} color={colors.text} />
              </View>

              <View style={styles.menuTextWrapper}>
                <AppText variant="default" style={styles.activityTitle}>
                  {activity.title}
                </AppText>
                <AppText variant="small" style={styles.menuSubtitle}>
                  {activity.subtitle}
                </AppText>
              </View>

              {activity.metaVariant === "duration" ? (
                <View style={styles.durationPill}>
                  <AppText variant="smallBold" style={styles.durationText}>
                    {activity.meta}
                  </AppText>
                </View>
              ) : (
                <View style={styles.scoreWrapper}>
                  <AppText variant="subtitle" style={styles.scoreText}>
                    {activity.meta}
                  </AppText>
                  <AppText variant="small" style={styles.menuSubtitle}>
                    Score
                  </AppText>
                </View>
              )}
            </View>
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

    scroll: {
      flex: 1,
    },

    content: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.section,
      gap: Spacing.xxl,
    },

    heading: {
      color: colors.text,
    },

    menuList: {
      gap: Spacing.md,
    },

    menuCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: Spacing.md,
    },

    menuCardPressed: {
      opacity: 0.7,
    },

    menuIconWrapper: {
      width: 48,
      height: 48,
      borderRadius: Radius.md,
      alignItems: "center",
      justifyContent: "center",
    },

    menuTextWrapper: {
      flex: 1,
      gap: Spacing.xxs,
    },

    menuTitle: {
      color: colors.text,
    },

    menuSubtitle: {
      color: colors.textSecondary,
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    sectionTitle: {
      color: colors.text,
      fontSize: 20,
    },

    seeAll: {
      color: colors.secondary,
    },

    activityList: {
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },

    activityRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
      padding: Spacing.md,
      // borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    activityIconWrapper: {
      width: 44,
      height: 44,
      borderRadius: Radius.full,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },

    activityTitle: {
      color: colors.text,
      fontWeight: "600",
    },

    durationPill: {
      backgroundColor: colors.background,
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
    },

    durationText: {
      color: colors.primary,
    },

    scoreWrapper: {
      alignItems: "flex-end",
    },

    scoreText: {
      color: colors.primary,
    },
  });

export default HomeScreen;
