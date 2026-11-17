import AppIcon from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import type { Subject } from "@/types";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

type Colors = ReturnType<typeof useTheme>["colors"];

const CARD_HEIGHT = 190;

const SubjectCard = ({ subject }: { subject: Subject }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Pressable
      onPress={() => router.push(`/subject/${subject.id}`)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: subject.color },
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 },
      ]}
    >
      {/* soft darkening gradient, Spotify-style */}
      <View style={styles.cardShade} pointerEvents="none" />

      {/* tilted "album art" tile peeking from the corner */}
      <View style={styles.artTile} pointerEvents="none">
        <AppIcon
          name={subject.icon}
          size={72}
          color={styles.cardTitle.color}
          strokeWidth={1.5}
        />
      </View>

      <View style={styles.cardTop}>
        <AppText variant="display" style={styles.cardTitle}>
          {subject.title}
        </AppText>
        <AppText variant="small" style={styles.cardTagline}>
          {subject.tagline}
        </AppText>
      </View>

      <View style={styles.cardBottom}>
        <View style={styles.chips}>
          {(
            [
              ["Headphones", subject.counts.audioLectures],
              ["AudioLines", subject.counts.keywordRevisions],
              ["BookOpenCheck", subject.counts.quizzes],
            ] as const
          )
            .filter(([, count]) => count > 0)
            .map(([icon, count]) => (
              <View key={icon} style={styles.chip}>
                <AppIcon name={icon} size={14} color={colors.onCard} />
                <AppText variant="caption" style={styles.chipText}>
                  {count}
                </AppText>
              </View>
            ))}
        </View>
        <View style={styles.playButton}>
          <AppIcon
            name="ArrowUpRight"
            size={24}
            color={styles.playIcon.color}
          />
        </View>
      </View>
    </Pressable>
  );
};

export default SubjectCard;

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    card: {
      height: CARD_HEIGHT,
      borderRadius: Radius.md,
      padding: Spacing.xl,
      paddingBottom: Spacing.lg,
      overflow: "hidden",
      justifyContent: "space-between",
    },
    cardShade: {
      ...StyleSheet.absoluteFill,
      experimental_backgroundImage:
        "linear-gradient(160deg, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.45) 100%)",
    },
    artTile: {
      position: "absolute",
      right: -18,
      top: 18,
      width: 120,
      height: 120,
      borderRadius: Radius.sm,
      backgroundColor: colors.cardTile,
      alignItems: "center",
      justifyContent: "center",
      transform: [{ rotate: "22deg" }],
      shadowColor: colors.shadow,
      shadowOpacity: 0.4,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    },
    cardTop: { maxWidth: "70%" },
    cardTitle: {
      color: colors.onCard,
    },
    cardTagline: {
      color: colors.onCardMuted,
      marginTop: Spacing.xs,
    },
    cardBottom: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.lg,
    },
    chips: {
      flex: 1,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.xs,
    },
    chip: {
      height: 28,
      paddingHorizontal: Spacing.md,
      borderRadius: Radius.full,
      backgroundColor: colors.cardTile,
      flexDirection: "row",
      gap: Spacing.xs,
      alignItems: "center",
      justifyContent: "center",
    },
    chipText: { color: colors.onCard },
    playButton: {
      width: 52,
      height: 52,
      borderRadius: Radius.full,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.shadow,
      shadowOpacity: 0.35,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    playIcon: { color: colors.onPrimary },
  });
