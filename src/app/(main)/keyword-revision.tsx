import AudioLectureCard from "@/components/core/audio/AudioLectureCard";
import { getClasses } from "@/api/classes.api";
import { getKeywordRevisions } from "@/api/keywords.api";
import AppSegmentedControl from "@/components/ui/AppSegmentedControl";
import { AppText } from "@/components/ui/AppText";
import AppTopBar from "@/components/ui/AppTopBar";
import type { AudioLecture } from "@/types";
import { Fragment , useMemo, useState } from "react";
import { Radius, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import { formatTotalDuration } from "@/utils/duration";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Pressable,
  FlatList,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Colors = ReturnType<typeof useTheme>["colors"];

const KeywordRevisionScreen = () => {
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

  const query = { page: 1, limit: 100, subjectId, classId };
  const {
    data: response,
    isLoading: isRevisionsLoading,
    isError: isRevisionsError,
    refetch: refetchRevisions,
    isRefetching,
  } = useQuery({
    queryKey: ["keyword-revisions", query],
    queryFn: () => getKeywordRevisions(query),
    enabled: !!subjectId && !!classId,
  });
  // isLoading is only true while a request is in flight, so a disabled
  // revisions query (no class yet) doesn't spin forever
  const isLoading = isClassesLoading || isRevisionsLoading;
  const isError = isClassesError || isRevisionsError;
  const refetch = () =>
    isClassesError || !classId ? refetchClasses() : refetchRevisions();

  // The API already groups revisions by chapter
  const sections = useMemo(
    () =>
      (response?.data ?? []).map((chapter) => ({
        key: chapter.id,
        title: chapter.name,
        duration: chapter.keywordRevisions.reduce(
          (sum, k) => sum + k.duration,
          0,
        ),
        data: chapter.keywordRevisions,
      })),
    [response],
  );

  // The playlist is the tapped keyword's chapter, so previous / next stay in it
  const openPlayer = (lecture: AudioLecture, playlist: AudioLecture[]) =>
    router.push({
      pathname: "/audio-player",
      params: {
        lecture: JSON.stringify(lecture),
        playlist: JSON.stringify(playlist),
        source: "keyword",
      },
    });

  type Chapter = (typeof sections)[number];

  const renderChapter = ({ item: chapter }: { item: Chapter }) => (
    <View style={styles.card}>
      <View style={styles.chapterHeader}>
        <AppText variant="cardTitle" style={styles.chapterTitle}>
          {chapter.title}
        </AppText>
        <AppText variant="caption" style={styles.headerMeta}>
          {chapter.data.length}{" "}
          {chapter.data.length === 1 ? "keyword" : "keywords"} •{" "}
          {formatTotalDuration(chapter.duration)}
        </AppText>
      </View>
      <View style={styles.headerDivider} />
      {chapter.data.map((lecture, index) => (
        <Fragment key={lecture.id}>
          {index > 0 && <View style={styles.rowDivider} />}
          <View style={styles.row}>
            <AudioLectureCard
              lecture={lecture}
              onPress={(l) => openPlayer(l, chapter.data)}
            />
          </View>
        </Fragment>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <AppTopBar title="Keywords Revision" />

      {classId && classOptions.length > 0 && (
        <AppSegmentedControl
          options={classOptions}
          value={classId}
          onChange={setSelectedClassId}
          style={styles.segment}
        />
      )}

      <FlatList
        data={sections}
        keyExtractor={(chapter) => chapter.key}
        renderItem={renderChapter}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.empty} />
          ) : (
            <Pressable onPress={() => refetch()} style={styles.empty}>
              <AppText variant="small" style={styles.emptyText}>
                {isError
                  ? "Couldn't load keyword revisions. Tap to retry."
                  : "No keyword revisions available yet."}
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
    headerMeta: { color: colors.textSecondary },
    card: {
      borderRadius: Radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.background,
      // soft lift on iOS / Android
      shadowColor: colors.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    chapterHeader: {
      gap: Spacing.xxs,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      backgroundColor: colors.surface,
      // Card can't clip (it would hide the iOS shadow), so round the header itself
      borderTopLeftRadius: Radius.lg,
      borderTopRightRadius: Radius.lg,
    },
    chapterTitle: { color: colors.text },
    headerDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
    row: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
    // Inset past the 42px thumbnail so the line starts under the titles
    rowDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginLeft: Spacing.lg + 42 + Spacing.md,
    },
    empty: { alignItems: "center", marginTop: Spacing.xl },
    list: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.xs,
      paddingBottom: Spacing.xxl,
      gap: Spacing.lg,
    },
    emptyText: { color: colors.textSecondary },
  });

export default KeywordRevisionScreen;
