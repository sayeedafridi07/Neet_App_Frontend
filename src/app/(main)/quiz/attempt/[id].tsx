import { saveQuizAnswer, submitQuizAttempt } from "@/api/quizAttempts.api";
import QuestionPalette from "@/components/core/quiz/QuestionPalette";
import QuestionWebView from "@/components/core/quiz/QuestionWebView";
import QuizTimer from "@/components/core/quiz/QuizTimer";
import { AppButton } from "@/components/ui/AppButton";
import AppIcon from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import AppTopBar from "@/components/ui/AppTopBar";
import { Radius, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import {
  QUIZ_ANSWER_STATUS,
  type QuizAnswerStatus,
  type QuizAttemptAnswer,
  type QuizPaletteStatus,
  type StartQuizAttemptData,
} from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
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

const isMarked = (status?: QuizAnswerStatus) =>
  status === QUIZ_ANSWER_STATUS.MARKED ||
  status === QUIZ_ANSWER_STATUS.MARKED_AND_ANSWERED;

/** Same rule the backend uses to derive status from a save. */
const statusFor = (
  selectedOptionId: string | null,
  marked: boolean,
): QuizAnswerStatus => {
  if (marked) {
    return selectedOptionId
      ? QUIZ_ANSWER_STATUS.MARKED_AND_ANSWERED
      : QUIZ_ANSWER_STATUS.MARKED;
  }
  return selectedOptionId
    ? QUIZ_ANSWER_STATUS.ANSWERED
    : QUIZ_ANSWER_STATUS.NOT_ANSWERED;
};

const errorMessage = (error: unknown, fallback: string) =>
  (isAxiosError(error) && error.response?.data?.message) || fallback;

const parse = (data?: string): Partial<StartQuizAttemptData> => {
  try {
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const QuizAttemptScreen = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);
  const queryClient = useQueryClient();
  const { id: attemptId, data } = useLocalSearchParams<{
    id: string;
    data: string;
  }>();

  // Parsed once — params don't change while on this screen.
  const [{ attempt, quiz, questions = [], answers: serverAnswers = [] }] =
    useState(() => parse(data));
  // Server's remainingSeconds anchored to when we received it, so a wrong
  // device clock can't shorten or extend the exam.
  const [deadline] = useState(() =>
    attempt ? Date.now() + attempt.remainingSeconds * 1000 : 0,
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAttemptAnswer[]>(() =>
    questions.map(
      (q, i) =>
        serverAnswers.find((a) => a.questionId === q.id) ?? {
          questionId: q.id,
          questionOrder: i + 1,
          selectedOptionId: null,
          status: QUIZ_ANSWER_STATUS.NOT_ANSWERED,
        },
    ),
  );
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const [showPalette, setShowPalette] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  const title = quiz?.title ?? "Quiz";
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];

  const paletteStatuses: QuizPaletteStatus[] = answers.map((a, i) =>
    a.status === QUIZ_ANSWER_STATUS.NOT_ANSWERED && !visited.has(i)
      ? "NOT_VISITED"
      : a.status,
  );

  const setAnswerAt = (index: number, value: QuizAttemptAnswer) =>
    setAnswers((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });

  const saveAnswer = async (
    selectedOptionId: string | null,
    marked: boolean,
  ) => {
    const index = currentIndex;
    const prevAnswer = answers[index];

    // Optimistic UI update
    setAnswerAt(index, {
      ...prevAnswer,
      selectedOptionId,
      status: statusFor(selectedOptionId, marked),
    });

    try {
      await saveQuizAnswer(attemptId, {
        questionId: prevAnswer.questionId,
        selectedOptionId,
        markedForReview: marked,
      });
    } catch (e) {
      setAnswerAt(index, prevAnswer); // roll back so the screen matches what's saved
      Alert.alert(
        "Answer not saved",
        errorMessage(e, "Check your connection and try again."),
      );
    }
  };

  const goTo = (index: number) => {
    if (index < 0 || index >= questions.length) return;
    setVisited((prev) => new Set(prev).add(index));
    setCurrentIndex(index);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const handleSelectOption = (optionId: string) => {
    // Tapping the selected option again clears it.
    const next = currentAnswer.selectedOptionId === optionId ? null : optionId;
    saveAnswer(next, isMarked(currentAnswer.status));
  };

  const handleMarkForReview = () =>
    saveAnswer(currentAnswer.selectedOptionId, !isMarked(currentAnswer.status));

  const handleClearResponse = () =>
    saveAnswer(null, isMarked(currentAnswer.status));

  const submit = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const res = await submitQuizAttempt(attemptId);
      // Progress (completed sets / %) changed — refetch quiz lists & detail.
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["quiz"] });
      router.replace({
        pathname: "/quiz/result/[attemptId]",
        params: { attemptId: res.data?.attemptId ?? attemptId },
      });
    } catch (e) {
      setIsSubmitting(false);
      Alert.alert(
        "Submit failed",
        errorMessage(e, "Couldn't submit your quiz. Please try again."),
      );
    }
  };

  const confirmSubmit = () => {
    const answered = answers.filter((a) => a.selectedOptionId).length;
    Alert.alert(
      "Submit quiz?",
      `Answered: ${answered}\nUnanswered: ${answers.length - answered}\n\nYou can't change answers after submitting.`,
      [
        { text: "Keep going", style: "cancel" },
        { text: "Submit", style: "destructive", onPress: submit },
      ],
    );
  };

  const confirmExit = () => {
    Alert.alert(
      "Leave quiz?",
      "Your answers are saved and the timer keeps running. Start the quiz again to resume.",
      [
        { text: "Stay", style: "cancel" },
        { text: "Leave", style: "destructive", onPress: () => router.back() },
      ],
    );
    return true;
  };

  // Android hardware back → confirm instead of silently leaving.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", confirmExit);
    return () => sub.remove();
  }, []);

  // No cached data, e.g. the app was reloaded on this screen.
  if (!attempt || !currentQuestion || !currentAnswer) {
    return (
      <SafeAreaView style={styles.container}>
        <AppTopBar title={title} />
        <Pressable onPress={() => router.back()} style={styles.empty}>
          <AppText variant="small" style={styles.muted}>
            {attempt
              ? "This quiz has no questions."
              : "Quiz session not found. Tap to go back and start it again."}
          </AppText>
        </Pressable>
      </SafeAreaView>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const marked = isMarked(currentAnswer.status);
  const isLast = currentIndex === questions.length - 1;
  const options = [...currentQuestion.options].sort(
    (a, b) => a.order - b.order,
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <AppTopBar
        title={title}
        onBackPress={confirmExit}
        rightAction={<QuizTimer deadline={deadline} onExpire={submit} />}
      />

      <View style={styles.progressHeader}>
        <View style={styles.row}>
          <AppText variant="bodyMedium" style={styles.text}>
            Question {currentIndex + 1}
            <AppText variant="small" style={styles.muted}>
              {" "}
              / {questions.length}
            </AppText>
          </AppText>
          <Pressable
            onPress={handleMarkForReview}
            style={[styles.reviewBtn, marked && styles.reviewBtnActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: marked }}
          >
            <AppIcon
              name="Bookmark"
              size={14}
              color={marked ? colors.onPrimary : colors.warning}
              fill={marked ? colors.onPrimary : "transparent"}
            />
            <AppText
              variant="caption"
              style={{ color: marked ? colors.onPrimary : colors.warning }}
            >
              {marked ? "Marked" : "Mark for review"}
            </AppText>
          </Pressable>
        </View>
        <View style={styles.track}>
          <View style={[styles.progress, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <QuestionWebView
          question={currentQuestion.question}
          imageUrl={currentQuestion.imageUrl}
          options={options}
          selectedOptionId={currentAnswer.selectedOptionId}
          onSelect={handleSelectOption}
          onClear={handleClearResponse}
          preloadUrls={questions
            .slice(currentIndex, currentIndex + 4)
            .flatMap((q) => [q.imageUrl, ...q.options.map((o) => o.imageUrl)])
            .filter((u): u is string => !!u)}
        />
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, Spacing.md) },
        ]}
      >
        <AppButton
          variant="outline"
          disabled={currentIndex === 0}
          onPress={() => goTo(currentIndex - 1)}
          style={styles.navBtn}
        >
          Previous
        </AppButton>
        <Pressable
          onPress={() => setShowPalette(true)}
          style={styles.paletteBtn}
          accessibilityLabel="Open question palette"
        >
          <AppIcon name="LayoutGrid" size={24} color={colors.primary} />
        </Pressable>
        {isLast ? (
          <AppButton
            onPress={confirmSubmit}
            loading={isSubmitting}
            style={styles.navBtn}
          >
            Submit
          </AppButton>
        ) : (
          <AppButton
            onPress={() => goTo(currentIndex + 1)}
            style={styles.navBtn}
          >
            Next
          </AppButton>
        )}
      </View>

      <QuestionPalette
        visible={showPalette}
        onClose={() => setShowPalette(false)}
        statuses={paletteStatuses}
        currentIndex={currentIndex}
        onSelect={goTo}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    empty: { alignItems: "center", marginTop: Spacing.xl },
    text: { color: colors.text },
    muted: { color: colors.textSecondary },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    pressed: { opacity: 0.8 },

    progressHeader: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    track: {
      height: 6,
      marginTop: Spacing.md,
      borderRadius: Radius.full,
      backgroundColor: colors.surface,
      overflow: "hidden",
    },
    progress: { height: "100%", backgroundColor: colors.primary },

    reviewBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.xs,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: colors.warning,
    },
    reviewBtnActive: { backgroundColor: colors.warning },

    scroll: { flex: 1 },
    content: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.section,
    },
    questionText: { color: colors.text, marginBottom: Spacing.xl },
    questionImage: {
      width: "100%",
      height: 200,
      borderRadius: Radius.sm,
      marginBottom: Spacing.xl,
      backgroundColor: colors.surface,
    },
    optionsLabel: { color: colors.primary },
    clearText: { color: colors.error },

    options: { gap: Spacing.md, marginTop: Spacing.md },
    option: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: Spacing.md,
      padding: Spacing.md,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    optionSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    },
    letter: {
      width: 28,
      height: 28,
      borderRadius: Radius.full,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    letterSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionBody: { flex: 1, gap: Spacing.sm, paddingTop: Spacing.xs },
    optionTextSelected: { color: colors.primary, fontWeight: "600" },
    optionImage: {
      width: "70%",
      height: 120,
      borderRadius: Radius.sm,
      backgroundColor: "#FFFFFF",
    },

    footer: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    navBtn: { flex: 1 },
    paletteBtn: {
      padding: Spacing.sm,
      borderRadius: Radius.md,
      backgroundColor: colors.surface,
    },
  });

export default QuizAttemptScreen;
