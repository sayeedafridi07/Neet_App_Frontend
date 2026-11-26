import { getAudioLectures } from "@/api/audio.api";
import AudioLectureCard from "@/components/core/audio/AudioLectureCard";
import PremiumBanner from "@/components/core/premium/PremiumBanner";
import AppSegmentedControl from "@/components/ui/AppSegmentedControl";
import { AppText } from "@/components/ui/AppText";
import AppTopBar from "@/components/ui/AppTopBar";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import type { AudioLecture } from "@/types";
import { formatTotalDuration } from "@/utils/duration";
import { useClasses } from "@/hooks/useClasses";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Colors = ReturnType<typeof useTheme>["colors"];

const AudioLectureScreen = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();

  const {
    classOptions,
    classId,
    className,
    selectedClass,
    setSelectedClassId,
    isLoading: isClassesLoading,
    isError: isClassesError,
    refetch: refetchClasses,
  } = useClasses();

  const isLocked = !!selectedClass?.isPremium;

  const query = { page: 1, limit: 100, subjectId, classId };
  const {
    data: response,
    isLoading: isLecturesLoading,
    isError: isLecturesError,
    refetch: refetchLectures,
  } = useQuery({
    queryKey: ["audio-lectures", query],
    queryFn: () => getAudioLectures(query),
    enabled: !!subjectId && !!classId,
  });
  const { audioLectures = [] } = response?.data || {};
  const lectures = audioLectures;

  const isLoading = isClassesLoading || isLecturesLoading;
  const isError = isClassesError || isLecturesError;
  const refetch = () =>
    isClassesError || !classId ? refetchClasses() : refetchLectures();
  const pullToRefresh = usePullToRefresh(refetch);
  const totalDuration = lectures.reduce((sum, l) => sum + l.duration, 0);

  const openPlayer = (lecture: AudioLecture) =>
    router.push({
      pathname: "/audio-player",
      params: { lecture: JSON.stringify(lecture), source: "lecture" },
    });

  const renderItem = ({ item }: { item: AudioLecture }) => (
    <AudioLectureCard
      lecture={item}
      locked={isLocked}
      onPress={isLocked ? () => router.push("/subscription") : openPlayer}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppTopBar title="Audio Lecture" />

      {classId && classOptions.length > 0 && (
        <AppSegmentedControl
          options={classOptions}
          value={classId}
          onChange={setSelectedClassId}
          style={styles.segment}
        />
      )}

      <FlatList
        data={lectures}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          lectures.length > 0 ? (
            <View>
              {isLocked && (
                <PremiumBanner
                  title={`Unlock ${className}`}
                  description="Get exam-ready with complete audio lectures."
                />
              )}
              <View style={styles.header}>
                <AppText variant="subtitle" style={styles.headerTitle}>
                  {className} Lectures
                </AppText>
                <AppText variant="small" style={styles.headerMeta}>
                  {lectures.length}{" "}
                  {lectures.length === 1 ? "lecture" : "lectures"} •{" "}
                  {formatTotalDuration(totalDuration)}
                </AppText>
              </View>
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
                  ? "Couldn't load lectures. Tap to retry."
                  : "No lectures available yet."}
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
    container: { flex: 1 },
    segment: {
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.sm,
      marginBottom: Spacing.md,
    },
    header: { gap: Spacing.xxs, marginBottom: Spacing.xs },
    headerTitle: { color: colors.text },
    headerMeta: { color: colors.textSecondary },
    empty: { alignItems: "center", marginTop: Spacing.xl },
    list: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.xxl,
      gap: Spacing.md,
    },
    emptyText: { color: colors.textSecondary },
  });

export default AudioLectureScreen;
