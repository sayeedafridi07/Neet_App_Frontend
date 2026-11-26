import { getQuizzes } from "@/api/quizzes.api";
import { AppButton } from "@/components/ui/AppButton";
import AppIcon from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { Radius, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import type { ApiQuiz } from "@/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import type { ComponentProps } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Colors = ReturnType<typeof useTheme>["colors"];

const PAGE_SIZE = 10;

const TestSeriesScreen = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["quizzes", "TEST_SERIES"],
    queryFn: ({ pageParam }) =>
      getQuizzes({
        page: pageParam,
        limit: PAGE_SIZE,
        type: "TEST_SERIES",
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const p = lastPage?.data?.pagination;
      return p && p.page < p.totalPages ? p.page + 1 : undefined;
    },
  });

  const quizzes = data?.pages.flatMap((p) => p?.data?.quizzes ?? []) ?? [];

  const pullToRefresh = usePullToRefresh(refetch);

  const renderStat = (
    icon: ComponentProps<typeof AppIcon>["name"],
    tint: string,
    label: string,
    value: string,
  ) => (
    <View style={styles.stat}>
      <View style={[styles.statIcon, { backgroundColor: tint + "22" }]}>
        <AppIcon name={icon} size={18} color={tint} />
      </View>
      <View style={styles.statText}>
        <AppText variant="caption" style={styles.statLabel}>
          {label}
        </AppText>
        <AppText variant="bodyMedium" style={styles.title}>
          {value}
        </AppText>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: ApiQuiz }) => (
    <View style={styles.card}>
      <AppText variant="bodyMedium" style={styles.cardTitle}>
        {item.title}
      </AppText>
      <View style={styles.divider} />
      <View style={styles.stats}>
        {renderStat(
          "Clock",
          colors.primary,
          "DURATION",
          item.durationMinutes ? `${item.durationMinutes} min` : "—",
        )}
        {renderStat(
          "Target",
          colors.success,
          "MARKING",
          `+${item.correctMarks} / ${item.wrongMarks}`,
        )}
        {renderStat(
          "ListOrdered",
          colors.error,
          "TOTAL QUESTIONS",
          String(item.questionCount),
        )}
        {renderStat(
          "Trophy",
          colors.warning,
          "TOTAL MARKS",
          String(item.questionCount * item.correctMarks),
        )}
      </View>
      <AppButton onPress={() => router.push(`/quiz/${item.id}`)}>
        Take Test
      </AppButton>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.top}>
        <AppText variant="title" style={styles.heading}>
          Test Series
        </AppText>
        <AppText variant="small" style={styles.subtitle}>
          Take tests to assess your knowledge and improve your skills.
        </AppText>
      </View>

      <FlatList
        data={quizzes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={pullToRefresh.refreshing}
        onRefresh={pullToRefresh.onRefresh}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color={colors.primary} />
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.empty} />
          ) : (
            <Pressable onPress={() => refetch()} style={styles.empty}>
              <AppText variant="small" style={styles.subtitle}>
                {isError
                  ? "Couldn't load test series. Tap to retry."
                  : "No test series available yet."}
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
    top: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.md,
      gap: Spacing.xs,
    },
    heading: { color: colors.text },
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
      padding: Spacing.lg,
      gap: Spacing.md,
    },
    cardTitle: { color: colors.text },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    stats: { flexDirection: "row", flexWrap: "wrap", rowGap: Spacing.lg },
    stat: {
      width: "50%",
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
    },
    statIcon: {
      width: 40,
      height: 40,
      borderRadius: Radius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    statText: { flex: 1 },
    statLabel: { color: colors.textSecondary },
    title: { color: colors.text },
    subtitle: { color: colors.textSecondary },
    empty: { alignItems: "center", marginTop: Spacing.xl },
  });

export default TestSeriesScreen;
