import AppIcon from "@/components/ui/AppIcon";
import { getClasses } from "@/api/classes.api";
import { getQuizzes } from "@/api/quizzes.api";
import AppSegmentedControl from "@/components/ui/AppSegmentedControl";
import { AppText } from "@/components/ui/AppText";
import AppTopBar from "@/components/ui/AppTopBar";
import type { ApiQuiz } from "@/types";
import { Radius, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
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
    isRefetching,
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

  const totalQuestions = quizzes.reduce(
    (sum, q) => sum + (q.questionCount ?? 0),
    0,
  );

  const renderItem = ({ item, index }: { item: ApiQuiz; index: number }) => (
    <Pressable
      onPress={() => router.push(`/quiz/${item.id}`)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.thumb}>
        <AppText variant="smallBold" style={styles.thumbText}>
          {String(index + 1).padStart(2, "0")}
        </AppText>
      </View>
      <View style={styles.info}>
        <AppText variant="bodyMedium" numberOfLines={1} style={styles.title}>
          {item.title}
        </AppText>
        {item.questionCount != null && (
          <AppText variant="small" style={styles.subtitle}>
            {item.questionCount} questions
          </AppText>
        )}
      </View>
      <AppIcon name="ChevronRight" size={20} color={colors.textMuted} />
    </Pressable>
  );

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
        refreshing={isRefetching}
        onRefresh={refetch}
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
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    thumbText: { color: colors.text },
    header: { gap: Spacing.xxs, marginBottom: Spacing.xs },
    headerTitle: { color: colors.text },
    headerMeta: { color: colors.textSecondary },
    info: { flex: 1, gap: Spacing.xxs },
    title: { color: colors.text },
    subtitle: { color: colors.textSecondary },
    empty: { alignItems: "center", marginTop: Spacing.xl },
    emptyText: { color: colors.textSecondary },
  });

export default McqPracticeScreen;
