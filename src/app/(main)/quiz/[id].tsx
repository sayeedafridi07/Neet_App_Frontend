import { startQuizAttempt } from "@/api/quizAttempts.api";
import { getQuizById } from "@/api/quizzes.api";
import { ANSWERED_MARKED } from "@/components/core/quiz/QuestionPalette";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import AppTopBar from "@/components/ui/AppTopBar";
import { Radius, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type Colors = ReturnType<typeof useTheme>["colors"];

const INSTRUCTIONS = [
  "Read each question carefully before selecting your answer.",
  "You can navigate between questions using the question grid or arrow buttons.",
  "Mark a question for review if you're unsure — you can revisit it anytime.",
  "Timer starts as soon as you press Start Test and cannot be paused.",
  "Once time is up, the test will auto-submit.",
  "Do not close or switch the app during the exam — your progress may not be saved.",
];

/** Question grid status colours, shown so students know what each means */
const getColorLegend = (colors: Colors) => [
  {
    key: "notVisited",
    label: "Not visited",
    bg: colors.background,
    border: colors.border,
    text: colors.text,
  },
  {
    key: "answered",
    label: "Answered",
    bg: colors.success,
    border: colors.success,
    text: colors.onPrimary,
  },
  {
    key: "notAnswered",
    label: "Visited but not answered",
    bg: colors.error,
    border: colors.error,
    text: colors.onPrimary,
  },
  {
    key: "review",
    label: "Marked for review",
    bg: colors.warning,
    border: colors.warning,
    text: colors.onPrimary,
  },
  {
    key: "answeredMarked",
    label: "Answered & marked for review",
    bg: ANSWERED_MARKED,
    border: ANSWERED_MARKED,
    text: colors.onPrimary,
  },
];

const QuizInstructionScreen = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["quiz", id],
    queryFn: () => getQuizById(id),
    enabled: !!id,
  });
  const quiz = response?.data;

  const { mutate: startQuiz, isPending: isStartingQuiz } = useMutation({
    mutationFn: () => startQuizAttempt(id),
    onSuccess: (response) => {
      router.replace({
        pathname: "/quiz/attempt/[id]",
        params: {
          id: response.data?.attempt.id ?? "",
          data: JSON.stringify(response.data),
        },
      });
    },
    onError: (e) => {
      console.log("startQuizAttempt error", e);
    },
  });
  const correctMarks = quiz?.correctMarks ?? 4;
  const wrongMarks = quiz?.wrongMarks ?? -1;
  const skippedMarks = quiz?.skippedMarks ?? 0;

  const stats = [
    { label: "Questions", value: quiz?.questionCount ?? "—" },
    {
      label: "Total Marks",
      value: quiz ? quiz.questionCount * correctMarks : "—",
    },
    {
      label: "Duration",
      value:
        quiz?.durationMinutes != null
          ? `${quiz.durationMinutes} min`
          : "No limit",
    },
  ];

  const marking = [
    {
      label: "Correct",
      value: `+${correctMarks}`,
      color: colors.success,
    },
    {
      label: "Wrong",
      value: `-${Math.abs(wrongMarks)}`,
      color: colors.error,
    },
    {
      label: "Skipped",
      value: `${skippedMarks}`,
      color: colors.warning,
    },
  ];

  if (isLoading || !quiz) {
    return (
      <SafeAreaView style={styles.container}>
        <AppTopBar title="Instructions" />
        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={styles.empty} />
        ) : (
          <Pressable onPress={() => refetch()} style={styles.empty}>
            <AppText variant="small" style={styles.mutedText}>
              {isError
                ? "Couldn't load quiz. Tap to retry."
                : "Quiz not found."}
            </AppText>
          </Pressable>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <AppTopBar title="Instructions" />

      <View style={styles.header}>
        <AppText variant="title" numberOfLines={2} style={styles.quizTitle}>
          {quiz.title}
        </AppText>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats (hidden for chapter quizzes) */}
        {quiz.type !== "CHAPTER" && (
          <View style={styles.row}>
            {stats.map((s) => (
              <View key={s.label} style={styles.statCard}>
                <AppText variant="subtitle" style={styles.statValue}>
                  {s.value}
                </AppText>
                <AppText variant="caption" style={styles.text}>
                  {s.label}
                </AppText>
              </View>
            ))}
          </View>
        )}

        {/* Marking scheme */}
        <View style={styles.section}>
          <AppText variant="cardTitle" style={styles.sectionTitle}>
            Marking Scheme
          </AppText>
          <View style={styles.row}>
            {marking.map((m) => (
              <View
                key={m.label}
                style={[styles.markingChip, { backgroundColor: m.color }]}
              >
                <AppText variant="subtitle" style={styles.onChip}>
                  {m.value}
                </AppText>
                <AppText variant="caption" style={styles.onChip}>
                  {m.label}
                </AppText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Question grid colour guide */}
        <View style={styles.section}>
          <AppText variant="cardTitle" style={styles.sectionTitle}>
            Question Grid Color Guide
          </AppText>
          <AppText variant="small" style={styles.sectionSubtitle}>
            The grid on the quiz screen shows each question&apos;s status using
            colors:
          </AppText>
          <View style={styles.legendList}>
            {getColorLegend(colors).map((item) => (
              <View key={item.key} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: item.bg, borderColor: item.border },
                  ]}
                >
                  <AppText variant="smallBold" style={{ color: item.text }}>
                    1
                  </AppText>
                </View>
                <AppText variant="small" style={styles.legendLabel}>
                  {item.label}
                </AppText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Instructions */}
        <View style={styles.section}>
          <AppText variant="cardTitle" style={styles.sectionTitle}>
            Instructions
          </AppText>
          {INSTRUCTIONS.map((instruction, index) => (
            <View key={instruction} style={styles.instructionRow}>
              <View style={styles.bullet}>
                <AppText variant="caption" style={styles.bulletText}>
                  {index + 1}
                </AppText>
              </View>
              <AppText variant="small" style={styles.instructionText}>
                {instruction}
              </AppText>
            </View>
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, Spacing.lg) },
        ]}
      >
        <AppButton
          size="large"
          onPress={() => startQuiz()}
          loading={isStartingQuiz}
        >
          Start Quiz
        </AppButton>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    empty: { alignItems: "center", marginTop: Spacing.xl },
    mutedText: { color: colors.textSecondary },
    text: { color: colors.text },

    header: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    quizTitle: { color: colors.text, textAlign: "center" },

    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.section,
    },

    row: { flexDirection: "row", gap: Spacing.md },
    statCard: {
      flex: 1,
      alignItems: "center",
      gap: Spacing.xxs,
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.sm,
      borderRadius: Radius.md,
      backgroundColor: colors.surface,
    },
    statValue: { color: colors.primary },

    section: { marginTop: Spacing.xl, marginBottom: Spacing.lg },
    sectionTitle: { color: colors.text, marginBottom: Spacing.md },
    sectionSubtitle: {
      color: colors.textSecondary,
      marginTop: -Spacing.xs,
      marginBottom: Spacing.md,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },

    markingChip: {
      flex: 1,
      alignItems: "center",
      gap: Spacing.xxs,
      paddingVertical: Spacing.lg,
      borderRadius: Radius.md,
    },
    onChip: { color: colors.onPrimary },

    legendList: { gap: Spacing.md },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
    },
    legendDot: {
      width: 36,
      height: 36,
      borderRadius: Radius.xs,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
    },
    legendLabel: { color: colors.text, flex: 1 },

    instructionRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: Spacing.md,
      marginBottom: Spacing.md,
    },
    bullet: {
      width: 24,
      height: 24,
      borderRadius: Radius.full,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    bulletText: { color: colors.onPrimary },
    instructionText: { color: colors.text, flex: 1 },

    passingNote: {
      backgroundColor: colors.surface,
      borderRadius: Radius.sm,
      padding: Spacing.lg,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },

    footer: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
  });

export default QuizInstructionScreen;
