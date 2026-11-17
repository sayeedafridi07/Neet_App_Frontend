import { AppButton } from "@/components/ui/AppButton";
import AppIcon from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import AppTopBar from "@/components/ui/AppTopBar";
import { useQuizResult } from "@/hooks/useQuizResult";
import { Radius, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import { formatTotalDuration } from "@/utils/duration";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type Colors = ReturnType<typeof useTheme>["colors"];

/** The backend has no pass mark, so the headline is based on score %. */
const getVerdict = (percent: number) => {
  if (percent >= 70)
    return {
      title: "Excellent work!",
      subtitle: "You've got a strong grip on this topic.",
      icon: "Trophy" as const,
    };
  if (percent >= 40)
    return {
      title: "Good effort!",
      subtitle: "Review the questions you missed to push your score higher.",
      icon: "Medal" as const,
    };
  return {
    title: "You can do better!",
    subtitle: "Review your answers and try the quiz again.",
    icon: "Target" as const,
  };
};

const formatDateTime = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

const QuizResultScreen = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);
  const { attemptId } = useLocalSearchParams<{ attemptId: string }>();
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuizResult(attemptId);
  const summary = response?.data?.result;

  if (isLoading || !summary) {
    return (
      <SafeAreaView style={styles.container}>
        <AppTopBar title="Result" />
        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={styles.empty} />
        ) : (
          <Pressable onPress={() => refetch()} style={styles.empty}>
            <AppText variant="small" style={styles.muted}>
              {isError
                ? "Couldn't load your result. Tap to retry."
                : "Result not found."}
            </AppText>
          </Pressable>
        )}
      </SafeAreaView>
    );
  }

  const { quiz, correctCount, wrongCount, skippedCount } = summary;
  const score = summary.score ?? 0;
  const total = quiz.totalQuestions || 1;
  const percent = quiz.totalMarks > 0 ? (score / quiz.totalMarks) * 100 : 0;
  const attempted = correctCount + wrongCount;
  const accuracy = attempted > 0 ? (correctCount / attempted) * 100 : 0;
  const verdict = getVerdict(percent);
  const verdictColor =
    percent >= 70
      ? colors.success
      : percent >= 40
        ? colors.warning
        : colors.error;

  const segments = [
    {
      key: "correct",
      label: "Correct",
      count: correctCount,
      color: colors.success,
    },
    { key: "wrong", label: "Wrong", count: wrongCount, color: colors.error },
    {
      key: "skipped",
      label: "Skipped",
      count: skippedCount,
      color: colors.warning,
    },
  ];

  const details = [
    { label: "Total questions", value: quiz.totalQuestions },
    { label: "Attempted", value: attempted },
    {
      label: "Accuracy",
      value: `${accuracy.toFixed(1)}%`,
    },
    {
      label: "Marking",
      value: `+${quiz.markingScheme.correct} / ${quiz.markingScheme.wrong} / ${quiz.markingScheme.skipped}`,
    },
    {
      label: "Time taken",
      value:
        summary.timeTakenSeconds != null
          ? formatTotalDuration(summary.timeTakenSeconds)
          : "—",
    },
    {
      label: "Submission",
      value: summary.status === "SUBMITTED" ? "Manual" : "Auto (time up)",
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <AppTopBar title="Result" onBackPress={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={ZoomIn.springify()}
          style={[styles.badge, { backgroundColor: verdictColor }]}
        >
          <AppIcon name={verdict.icon} size={44} color={colors.onPrimary} />
        </Animated.View>

        <AppText variant="title" style={styles.title}>
          {verdict.title}
        </AppText>
        <AppText variant="small" style={styles.subtitle}>
          {verdict.subtitle}
        </AppText>

        <Animated.View
          entering={FadeInDown.delay(100)}
          style={styles.scoreCard}
        >
          <AppText variant="bodyMedium" style={styles.text}>
            {quiz.title}
          </AppText>
          <View style={styles.scoreRow}>
            <AppText style={styles.scoreNumber}>{score}</AppText>
            <AppText variant="subtitle" style={styles.muted}>
              {" "}
              / {quiz.totalMarks}
            </AppText>
          </View>
          <AppText variant="caption" style={styles.muted}>
            {percent.toFixed(1)}% score
          </AppText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <AppText variant="overline" style={styles.sectionTitle}>
            Breakdown
          </AppText>
          <View style={styles.card}>
            <View style={styles.barTrack}>
              {segments.map((s) =>
                s.count > 0 ? (
                  <View
                    key={s.key}
                    style={{
                      width: `${(s.count / total) * 100}%`,
                      backgroundColor: s.color,
                    }}
                  />
                ) : null,
              )}
            </View>
            <View style={styles.legendRow}>
              {segments.map((s) => (
                <View key={s.key} style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: s.color }]}
                  />
                  <AppText variant="caption" style={styles.text}>
                    {s.label}
                  </AppText>
                  <AppText variant="smallBold" style={styles.text}>
                    {s.count}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)}>
          <AppText variant="overline" style={styles.sectionTitle}>
            Details
          </AppText>
          <View style={styles.detailCard}>
            {details.map((d, i) => (
              <View
                key={d.label}
                style={[
                  styles.statRow,
                  i === details.length - 1 && styles.statRowLast,
                ]}
              >
                <AppText variant="small" style={styles.text}>
                  {d.label}
                </AppText>
                <AppText variant="smallBold" style={styles.text}>
                  {d.value}
                </AppText>
              </View>
            ))}
          </View>
        </Animated.View>

        <AppText variant="caption" style={styles.meta}>
          Submitted {formatDateTime(summary.submittedAt)}
        </AppText>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, Spacing.md) },
        ]}
      >
        <AppButton
          variant="outline"
          style={styles.btn}
          onPress={() =>
            router.push({
              pathname: "/quiz/review/[attemptId]",
              params: { attemptId },
            })
          }
        >
          Review Answers
        </AppButton>
        <AppButton
          style={styles.btn}
          onPress={() =>
            router.replace({
              pathname: "/quiz/[id]",
              params: { id: quiz.id },
            })
          }
        >
          Retake Quiz
        </AppButton>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    empty: { alignItems: "center", marginTop: Spacing.xl },
    text: { color: colors.text },
    muted: { color: colors.textSecondary },
    content: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.section,
    },

    badge: {
      alignSelf: "center",
      width: 88,
      height: 88,
      borderRadius: Radius.full,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: Spacing.lg,
    },
    title: { color: colors.text, textAlign: "center" },
    subtitle: {
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: Spacing.xs,
    },

    scoreCard: {
      alignItems: "center",
      gap: Spacing.xs,
      marginTop: Spacing.xl,
      padding: Spacing.lg,
      borderRadius: Radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    scoreRow: { flexDirection: "row", alignItems: "baseline" },
    scoreNumber: {
      fontSize: 52,
      lineHeight: 60,
      fontWeight: "700",
      color: colors.primary,
    },

    sectionTitle: {
      color: colors.textSecondary,
      marginTop: Spacing.xxl,
      marginBottom: Spacing.sm,
    },
    card: {
      gap: Spacing.md,
      padding: Spacing.lg,
      borderRadius: Radius.md,
      backgroundColor: colors.surface,
    },
    barTrack: {
      flexDirection: "row",
      height: 8,
      borderRadius: Radius.full,
      overflow: "hidden",
      backgroundColor: colors.border,
    },
    legendRow: { flexDirection: "row", justifyContent: "space-between" },
    legendItem: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
    legendDot: { width: 8, height: 8, borderRadius: Radius.full },

    detailCard: {
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    statRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    statRowLast: { borderBottomWidth: 0 },
    meta: {
      color: colors.textMuted,
      textAlign: "center",
      marginTop: Spacing.md,
    },

    footer: {
      flexDirection: "row",
      gap: Spacing.sm,
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    btn: { flex: 1 },
  });

export default QuizResultScreen;
