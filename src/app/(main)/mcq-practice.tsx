import { getClasses } from "@/api/classes.api";
import { getQuizzes } from "@/api/quizzes.api";
import AppIcon from "@/components/ui/AppIcon";
import AppSegmentedControl from "@/components/ui/AppSegmentedControl";
import { AppText } from "@/components/ui/AppText";
import AppTopBar from "@/components/ui/AppTopBar";
import { Radius, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import type { ApiQuiz } from "@/types";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Colors = ReturnType<typeof useTheme>["colors"];

const McqPracticeScreen = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();

  const {
    data: classesResponse,
    isLoading: isClassesLoading,
    isError: isClassesError,
    refetch: refetchClasses,
  } = useQuery({
    queryKey: ["classes"],
    queryFn: getClasses,
  });
  const { classes = [] } = classesResponse?.data || {};
  const classOptions = classes.map((c) => ({ label: c.name, value: c.id }));

  // Default to the first class until the user picks one
  const [selectedClassId, setSelectedClassId] = useState<string>();
  const classId = selectedClassId ?? classes[0]?.id;
  const className = classes.find((c) => c.id === classId)?.name;

  const query = { page: 1, limit: 100, subjectId, classId };
  const {
    data: response,
    isLoading: isQuizzesLoading,
    isError: isQuizzesError,
    refetch: refetchQuizzes,
  } = useQuery({
    queryKey: ["quizzes", query],
    queryFn: () => getQuizzes(query),
    enabled: !!subjectId && !!classId,
  });
  const { quizzes = [] } = response?.data || {};

  // isLoading is only true while a request is in flight, so a disabled
  // quizzes query (no class yet) doesn't spin forever
  const isLoading = isClassesLoading || isQuizzesLoading;
  const isError = isClassesError || isQuizzesError;
  const refetch = () =>
    isClassesError || !classId ? refetchClasses() : refetchQuizzes();

  const pullToRefresh = usePullToRefresh(refetch);

  const totalQuestions = quizzes.reduce(
    (sum, q) => sum + (q.questionCount ?? 0),
    0,
  );

  const renderItem = ({ item, index }: { item: ApiQuiz; index: number }) => {
    const progress = item.progress;
    const percent = Math.min(
      100,
      Math.max(0, Math.round(progress?.completionPercentage ?? 0)),
    );
    const totalQuestions = progress?.totalQuestions ?? item.questionCount;

    return (
      <Pressable
        onPress={() => router.push(`/quiz/${item.id}`)}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.thumb}>
            <AppText variant="smallBold" style={styles.thumbText}>
              {String(index + 1).padStart(2, "0")}
            </AppText>
          </View>
          <View style={styles.info}>
            <AppText
              variant="bodyMedium"
              numberOfLines={2}
              style={styles.title}
            >
              {item.chapter?.name ?? item.title}
            </AppText>
            <AppText variant="small" style={styles.subtitle}>
              {totalQuestions} questions
              {progress ? ` • ${progress.totalSets} sets` : ""}
            </AppText>
          </View>
          <AppIcon name="ChevronRight" size={20} color={colors.textMuted} />
        </View>

        {progress && (
          <View style={styles.progressBlock}>
            <View style={styles.progressLabels}>
              <AppText variant="small" style={styles.subtitle}>
                {progress.completedSets}/{progress.totalSets} sets completed
              </AppText>
              <AppText variant="smallBold" style={styles.progressText}>
                {percent}%
              </AppText>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${percent}%` }]} />
            </View>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <AppTopBar title="MCQ Practice" />

      {classId && classOptions.length > 0 && (
        <AppSegmentedControl
          options={classOptions}
          value={classId}
          onChange={setSelectedClassId}
          style={styles.segment}
        />
      )}

      <FlatList
        data={quizzes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          quizzes.length > 0 ? (
            <View style={styles.header}>
              <AppText variant="subtitle" style={styles.headerTitle}>
                {className} Quizzes
              </AppText>
              <AppText variant="small" style={styles.headerMeta}>
                {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"}
                {totalQuestions > 0 ? ` • ${totalQuestions} questions` : ""}
              </AppText>
            </View>
          ) : null
        }
        refreshing={pullToRefresh.refreshing}
        onRefresh={pullToRefresh.onRefresh}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.empty} />
          ) : (
            <Pressable onPress={() => refetch()} style={styles.empty}>
              <AppText variant="small" style={styles.emptyText}>
                {isError
                  ? "Couldn't load quizzes. Tap to retry."
                  : "No quizzes available yet."}
              </AppText>
            </Pressable>
          )
        }
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    segment: {
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.sm,
      marginBottom: Spacing.md,
    },
    list: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.section * 2,
      gap: Spacing.md,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      padding: Spacing.md,
      gap: Spacing.md,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
    },
    pressed: { opacity: 0.7, transform: [{ scale: 0.99 }] },
    thumb: {
      width: 44,
      height: 44,
      borderRadius: Radius.md,
      backgroundColor: colors.primary + "22",
      alignItems: "center",
      justifyContent: "center",
    },
    thumbText: { color: colors.primary },
    header: { gap: Spacing.xxs, marginBottom: Spacing.xs },
    headerTitle: { color: colors.text },
    headerMeta: { color: colors.textSecondary },
    info: { flex: 1, gap: Spacing.xxs },
    title: { color: colors.text },
    subtitle: { color: colors.textSecondary },
    progressBlock: { gap: Spacing.xs },
    progressLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    progressTrack: {
      height: 6,
      borderRadius: Radius.full,
      backgroundColor: colors.border,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: Radius.full,
      backgroundColor: colors.primary,
    },
    progressText: { color: colors.primary },
    empty: { alignItems: "center", marginTop: Spacing.xl },
    emptyText: { color: colors.textSecondary },
  });

export default McqPracticeScreen;
