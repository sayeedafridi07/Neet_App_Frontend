import { getQuizzes } from "@/api/quizzes.api";
import { TestSeriesCard } from "@/components/core/test-series/TestSeriesCard";
import { AppText } from "@/components/ui/AppText";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import { useInfiniteQuery } from "@tanstack/react-query";
import { router } from "expo-router";
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
        renderItem={({ item }) => (
          <TestSeriesCard
            quiz={item}
            onPress={() => router.push(`/quiz/${item.id}`)}
          />
        )}
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
    subtitle: { color: colors.textSecondary },
    empty: { alignItems: "center", marginTop: Spacing.xl },
  });

export default TestSeriesScreen;
