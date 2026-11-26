import { AppButton } from "@/components/ui/AppButton";
import AppIcon from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import type { ApiQuiz } from "@/types";
import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";

type Colors = ReturnType<typeof useTheme>["colors"];

type Props = {
  quiz: ApiQuiz;
  onPress: () => void;
};

export function TestSeriesCard({ quiz, onPress }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const renderStat = (
    icon: ComponentProps<typeof AppIcon>["name"],
    tint: string,
    label: string,
    value: string,
  ) => (
    <View style={styles.stat}>
      <View style={[styles.statIcon, { backgroundColor: tint + "22" }]}>
        <AppIcon name={icon} size={16} color={tint} />
      </View>
      <View style={styles.statText}>
        <AppText variant="caption" style={styles.statLabel} numberOfLines={1}>
          {label}
        </AppText>
        <AppText variant="bodyMedium" style={styles.statValue}>
          {value}
        </AppText>
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      <AppText variant="cardTitle" style={styles.title}>
        {quiz.title}
      </AppText>
      <View style={styles.divider} />
      <View style={styles.stats}>
        {renderStat(
          "Clock",
          colors.primary,
          "Duration",
          quiz.durationMinutes ? `${quiz.durationMinutes} min` : "—",
        )}
        {renderStat(
          "Target",
          colors.success,
          "Marking",
          `+${quiz.correctMarks} / -${Math.abs(quiz.wrongMarks)}`,
        )}
        {renderStat(
          "ListOrdered",
          colors.error,
          "Questions",
          String(quiz.questionCount),
        )}
        {renderStat(
          "Trophy",
          colors.warning,
          "Total Marks",
          String(quiz.questionCount * quiz.correctMarks),
        )}
      </View>
      <AppButton onPress={onPress}>Take Test</AppButton>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      padding: Spacing.md,
      gap: Spacing.md,
    },
    title: { color: colors.text },
    divider: { height: 1, backgroundColor: colors.border },
    stats: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
    stat: {
      flexBasis: "45%",
      flexGrow: 1,
      backgroundColor: colors.background,
      borderRadius: Radius.md,
      padding: Spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
    },
    statIcon: {
      width: 32,
      height: 32,
      borderRadius: Radius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    statText: { flex: 1 },
    statLabel: { color: colors.textSecondary },
    statValue: { color: colors.text },
  });
