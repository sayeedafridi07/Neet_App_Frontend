import { AppText } from "@/components/ui/AppText";
import { LECTURE_FALLBACK_IMAGE } from "@/data/audioLectures";
import type { AudioLecture } from "@/types";
import { Radius, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import { formatDuration } from "@/utils/duration";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";

interface AudioLectureCardProps {
  lecture: AudioLecture;
  onPress: (lecture: AudioLecture) => void;
}

const AudioLectureCard = ({
  lecture,
  onPress,
}: AudioLectureCardProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Pressable
      onPress={() => onPress(lecture)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Image
        source={lecture.imageUrl ?? LECTURE_FALLBACK_IMAGE}
        style={styles.thumb}
        contentFit="cover"
        transition={200}
      />

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <AppText
            variant="bodyMedium"
            numberOfLines={1}
            style={styles.title}
          >
            {lecture.title}
          </AppText>
        </View>
        {!!lecture.description && (
          <AppText variant="small" numberOfLines={1} style={styles.subtitle}>
            {lecture.description}
          </AppText>
        )}
      </View>

      <AppText variant="small" style={styles.duration}>
        {formatDuration(lecture.duration)}
      </AppText>
    </Pressable>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
    },
    pressed: { opacity: 0.6 },
    thumb: {
      width: 42,
      height: 42,
      borderRadius: Radius.xs,
      backgroundColor: colors.border,
    },
    info: { flex: 1, gap: Spacing.xxs },
    titleRow: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
    title: { flexShrink: 1, color: colors.text },
    subtitle: { color: colors.textSecondary },
    duration: { color: colors.textMuted, fontVariant: ["tabular-nums"] },
  });

export default AudioLectureCard;
