import QuestionPalette from "@/components/core/quiz/QuestionPalette";
import AppIcon from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import AppTopBar from "@/components/ui/AppTopBar";
import { useQuizResult } from "@/hooks/useQuizResult";
import { Radius, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import type {
  QuizAttemptSummary,
  QuizQuestionResult,
  QuizResultOption,
  QuizResultQuestion,
} from "@/types";
import { formatTotalDuration } from "@/utils/duration";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { memo, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Colors = ReturnType<typeof useTheme>["colors"];
type Styles = ReturnType<typeof createStyles>;

const RESULT_LABEL: Record<QuizQuestionResult, string> = {
  CORRECT: "Correct",
  WRONG: "Wrong",
  SKIPPED: "Skipped",
};

const getBadgeColors = (result: QuizQuestionResult, colors: Colors) => {
  switch (result) {
    case "CORRECT":
      return { bg: colors.success, text: colors.onPrimary };
    case "WRONG":
      return { bg: colors.error, text: colors.onPrimary };
    default:
      return { bg: colors.surface, text: colors.textSecondary };
  }
};

/** Correct option is always green (picked or missed); a wrong pick is red. */
const getOptionColors = (option: QuizResultOption, colors: Colors) => {
  if (option.isCorrect) {
    return {
      bg: colors.success,
      border: colors.success,
      text: colors.onPrimary,
    };
  }
  if (option.isSelected) {
    return { bg: colors.error, border: colors.error, text: colors.onPrimary };
  }
  return { bg: colors.background, border: colors.border, text: colors.text };
};

const formatMarks = (marks: number) => (marks > 0 ? `+${marks}` : `${marks}`);

const ReviewHeader = ({
  summary,
  styles,
  colors,
}: {
  summary: QuizAttemptSummary;
  styles: Styles;
  colors: Colors;
}) => {
  const chips = [
    {
      label: "Correct",
      value: summary.correctCount,
      ...getBadgeColors("CORRECT", colors),
    },
    {
      label: "Wrong",
      value: summary.wrongCount,
      ...getBadgeColors("WRONG", colors),
    },
    {
      label: "Skipped",
      value: summary.skippedCount,
      ...getBadgeColors("SKIPPED", colors),
    },
  ];

  return (
    <View style={styles.header}>
      <AppText variant="title" style={styles.quizTitle}>
        {summary.quiz.title}
      </AppText>

      <View style={styles.row}>
        <View style={styles.statCard}>
          <AppText variant="subtitle" style={styles.statValue}>
            {summary.score ?? 0} / {summary.quiz.totalMarks}
          </AppText>
          <AppText variant="caption" style={styles.muted}>
            Score
          </AppText>
        </View>
        <View style={styles.statCard}>
          <AppText variant="subtitle" style={styles.statValue}>
            {summary.timeTakenSeconds != null
              ? formatTotalDuration(summary.timeTakenSeconds)
              : "—"}
          </AppText>
          <AppText variant="caption" style={styles.muted}>
            Time Taken
          </AppText>
        </View>
      </View>

      <View style={styles.row}>
        {chips.map((c) => (
          <View
            key={c.label}
            style={[
              styles.breakdownChip,
              { backgroundColor: c.bg },
              c.bg === colors.surface && styles.outlined,
            ]}
          >
            <AppText variant="smallBold" style={{ color: c.text }}>
              {c.label}: {c.value}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
};

const QuestionCard = memo(function QuestionCard({
  item,
  index,
  styles,
  colors,
}: {
  item: QuizResultQuestion;
  index: number;
  styles: Styles;
  colors: Colors;
}) {
  const badge = getBadgeColors(item.result, colors);
  const options = [...item.options].sort((a, b) => a.order - b.order);
  const hasExplanation = !!item.explanation || !!item.explanationImageUrl;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.qLabel}>
          <AppText variant="smallBold" style={styles.qLabelText}>
            Q{index + 1}.
          </AppText>
        </View>
        <View
          style={[
            styles.badge,
            { backgroundColor: badge.bg },
            item.result === "SKIPPED" && styles.outlined,
          ]}
        >
          <AppText variant="caption" style={{ color: badge.text }}>
            {RESULT_LABEL[item.result]}
          </AppText>
        </View>
      </View>

      <AppText variant="bodyMedium" style={styles.questionText}>
        {item.question}
      </AppText>
      {!!item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.questionImage}
          contentFit="contain"
          contentPosition="top"
          cachePolicy="memory-disk"
          transition={200}
        />
      )}

      <AppText variant="smallBold" style={styles.optionsLabel}>
        Options:
      </AppText>
      <View style={styles.options}>
        {options.map((option, i) => {
          const c = getOptionColors(option, colors);
          return (
            <View
              key={option.id}
              style={[
                styles.option,
                { backgroundColor: c.bg, borderColor: c.border },
              ]}
              accessibilityLabel={`Option ${String.fromCharCode(65 + i)}${
                option.isCorrect ? ", correct answer" : ""
              }${option.isSelected ? ", your answer" : ""}`}
            >
              <AppText variant="smallBold" style={{ color: c.text }}>
                {String.fromCharCode(65 + i)}.
              </AppText>
              <View style={styles.optionBody}>
                {!!option.text && (
                  <AppText variant="small" style={{ color: c.text }}>
                    {option.text}
                  </AppText>
                )}
                {!!option.imageUrl && (
                  <Image
                    source={{ uri: option.imageUrl }}
                    style={styles.optionImage}
                    contentFit="contain"
                    cachePolicy="memory-disk"
                  />
                )}
                {option.isSelected && (
                  <AppText variant="caption" style={{ color: c.text }}>
                    Your answer
                  </AppText>
                )}
              </View>
              {option.isCorrect && (
                <AppIcon name="CircleCheck" size={18} color={c.text} />
              )}
              {option.isSelected && !option.isCorrect && (
                <AppIcon name="CircleX" size={18} color={c.text} />
              )}
            </View>
          );
        })}
      </View>

      {hasExplanation && (
        <View style={styles.explanation}>
          <AppText variant="smallBold" style={styles.explanationTitle}>
            Explanation
          </AppText>
          {!!item.explanation && (
            <AppText variant="small" style={styles.text}>
              {item.explanation}
            </AppText>
          )}
          {!!item.explanationImageUrl && (
            <Image
              source={{ uri: item.explanationImageUrl }}
              style={styles.questionImage}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          )}
        </View>
      )}

      <AppText variant="small" style={styles.marks}>
        Marks awarded:{" "}
        <AppText
          variant="smallBold"
          style={{
            color:
              item.marks > 0
                ? colors.success
                : item.marks < 0
                  ? colors.error
                  : colors.text,
          }}
        >
          {formatMarks(item.marks)}
        </AppText>
      </AppText>
    </View>
  );
});

const QuizReviewScreen = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { attemptId } = useLocalSearchParams<{ attemptId: string }>();
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuizResult(attemptId);
  const [showPalette, setShowPalette] = useState(false);
  const listRef = useRef<FlatList<QuizResultQuestion>>(null);

  const data = response?.data;
  const questions = useMemo(() => data?.questions ?? [], [data]);
  const statuses = useMemo(() => questions.map((q) => q.result), [questions]);

  const scrollToQuestion = (index: number) => {
    // Let the palette sheet finish closing before scrolling.
    setTimeout(() => {
      listRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0,
      });
    }, 300);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <AppTopBar
        title="Review Answers"
        rightAction={
          data ? (
            <Pressable
              onPress={() => setShowPalette(true)}
              style={styles.paletteBtn}
              hitSlop={6}
              accessibilityLabel="Jump to question"
            >
              <AppIcon name="LayoutGrid" size={20} color={colors.primary} />
            </Pressable>
          ) : null
        }
      />

      {!data ? (
        isLoading ? (
          <ActivityIndicator color={colors.primary} style={styles.empty} />
        ) : (
          <Pressable onPress={() => refetch()} style={styles.empty}>
            <AppText variant="small" style={styles.muted}>
              {isError
                ? "Couldn't load answers. Tap to retry."
                : "Nothing to review."}
            </AppText>
          </Pressable>
        )
      ) : (
        <FlatList
          ref={listRef}
          data={questions}
          keyExtractor={(q) => q.id}
          ListHeaderComponent={
            <ReviewHeader
              summary={data.result}
              styles={styles}
              colors={colors}
            />
          }
          renderItem={({ item, index }) => (
            <QuestionCard
              item={item}
              index={index}
              styles={styles}
              colors={colors}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          initialNumToRender={4}
          windowSize={9}
          // Cards have variable height: jump near the target, then retry.
          onScrollToIndexFailed={(info) => {
            listRef.current?.scrollToOffset({
              offset: info.averageItemLength * info.index,
              animated: false,
            });
            setTimeout(() => {
              listRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
                viewPosition: 0,
              });
            }, 100);
          }}
        />
      )}

      <QuestionPalette
        visible={showPalette}
        onClose={() => setShowPalette(false)}
        statuses={statuses}
        currentIndex={-1}
        onSelect={scrollToQuestion}
        mode="review"
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    empty: { alignSelf: "center", marginTop: Spacing.xl },
    text: { color: colors.text },
    muted: { color: colors.textSecondary },
    row: { flexDirection: "row", gap: Spacing.md },
    outlined: { borderWidth: 1, borderColor: colors.border },
    paletteBtn: {
      padding: Spacing.sm,
      borderRadius: Radius.md,
      backgroundColor: colors.surface,
    },

    list: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.sm,
      paddingBottom: Spacing.section,
      gap: Spacing.lg,
    },

    header: { gap: Spacing.lg, marginBottom: Spacing.xs },
    quizTitle: { color: colors.text, textAlign: "center" },
    statCard: {
      flex: 1,
      alignItems: "center",
      gap: Spacing.xxs,
      padding: Spacing.lg,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    statValue: { color: colors.primary },
    breakdownChip: {
      flex: 1,
      alignItems: "center",
      paddingVertical: Spacing.sm,
      borderRadius: Radius.sm,
    },

    card: {
      padding: Spacing.lg,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: Spacing.lg,
    },
    qLabel: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xxs,
      borderRadius: Radius.full,
      backgroundColor: colors.surface,
    },
    qLabelText: { color: colors.primary },
    badge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xxs,
      borderRadius: Radius.full,
    },
    questionText: { color: colors.text, marginBottom: Spacing.xl },
    questionImage: {
      width: "100%",
      height: 180,
      borderRadius: Radius.sm,
      marginBottom: Spacing.lg,
      backgroundColor: colors.surface,
    },
    optionsLabel: { color: colors.primary, marginBottom: Spacing.md },
    options: { gap: Spacing.md },
    option: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: Spacing.sm,
      padding: Spacing.md,
      borderRadius: Radius.lg,
      borderWidth: 1,
    },
    optionBody: { flex: 1, gap: Spacing.xs },
    optionImage: {
      width: "70%",
      height: 110,
      borderRadius: Radius.sm,
      backgroundColor: "#FFFFFF",
    },

    explanation: {
      gap: Spacing.xs,
      marginTop: Spacing.lg,
      padding: Spacing.lg,
      borderRadius: Radius.md,
      backgroundColor: colors.surface,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    explanationTitle: { color: colors.primary },
    marks: {
      color: colors.text,
      marginTop: Spacing.lg,
      textAlign: "right",
    },
  });

export default QuizReviewScreen;
