import { getSubjectById } from "@/api/subjects.api";
import AppIcon from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import { toSubject } from "@/data/subjects";
import { Radius, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams, type Href } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Colors = ReturnType<typeof useTheme>["colors"];

type Row = {
  key: string;
  count: number;
  title: string;
  meta: string;
  icon: "Headphones" | "AudioLines" | "BookOpenCheck";
  variant: "filled" | "tint" | "outline";
  href: Href;
};

const SubjectDetailScreen = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    data: response,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["subject", id],
    queryFn: () => getSubjectById(id),
    enabled: !!id,
  });
  const subjectData = response?.data;

  if (!subjectData) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  const subject = toSubject(subjectData);

  const rows = (
    [
      {
        key: "audio",
        count: subject.counts.audioLectures,
        title: "Audio Lectures",
        meta: `Chapter-wise · ${subject.counts.audioLectures} lectures`,
        icon: "Headphones",
        variant: "filled",
        href: {
          pathname: "/audio-lecture",
          params: { subjectId: subject.id },
        },
      },
      {
        key: "keywords",
        count: subject.counts.keywordRevisions,
        title: "Audio Keywords",
        meta: `Revision · ${subject.counts.keywordRevisions} keyword sets`,
        icon: "AudioLines",
        variant: "tint",
        href: {
          pathname: "/keyword-revision",
          params: { subjectId: subject.id },
        },
      },
      {
        key: "mcq",
        count: subject.counts.quizzes,
        title: "MCQ Practice",
        meta: `Practice · ${subject.counts.quizzes} quizzes`,
        icon: "BookOpenCheck",
        variant: "outline",
        href: {
          pathname: "/mcq-practice",
          params: { subjectId: subject.id },
        },
      },
    ] satisfies Row[]
  ).filter((row) => row.count > 0);

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View
        style={[
          styles.hero,
          {
            backgroundColor: subject.color,
            paddingTop: insets.top + Spacing.sm,
          },
        ]}
      >
        <View style={styles.heroShade} pointerEvents="none" />
        <View style={[styles.ring, styles.ringLg]} pointerEvents="none" />
        <View style={[styles.ring, styles.ringMd]} pointerEvents="none" />

        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.backBtn}
        >
          <AppIcon name="ChevronLeft" color={colors.onCard} />
        </Pressable>

        <View style={styles.heroRow}>
          <View style={styles.heroText}>
            <AppText variant="display" style={styles.title}>
              {subject.title}
            </AppText>
            <AppText variant="small" style={styles.tagline}>
              {subject.tagline}
            </AppText>
          </View>
          <View style={styles.artTile}>
            <AppIcon
              name={subject.icon}
              size={64}
              color={colors.onCard}
              strokeWidth={1.4}
            />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingBottom: insets.bottom + Spacing.section,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Track-style list */}
        <View style={styles.list}>
          <View style={styles.sectionHeader}>
            <AppText variant="subtitle" style={styles.sectionTitle}>
              Start learning
            </AppText>
            <AppText variant="small" style={styles.sectionSubtitle}>
              Listen, revise and practise {subject.title} your way
            </AppText>
          </View>
          {rows.map((row) => (
            <Pressable
              key={row.key}
              onPress={() => router.push(row.href)}
              style={({ pressed }) => [
                styles.row,
                pressed && { backgroundColor: colors.surface },
              ]}
            >
              <View
                style={[
                  styles.rowArt,
                  row.variant === "filled" && {
                    backgroundColor: subject.color,
                  },
                  row.variant === "tint" && {
                    backgroundColor: `${subject.color}26`,
                  },
                  row.variant === "outline" && {
                    backgroundColor: "transparent",
                    borderWidth: 1.5,
                    borderColor: `${subject.color}80`,
                  },
                ]}
              >
                <AppIcon
                  name={row.icon}
                  size={24}
                  color={
                    row.variant === "filled" ? colors.onCard : subject.color
                  }
                  strokeWidth={2}
                />
              </View>
              <View style={styles.rowText}>
                <AppText
                  variant="bodyMedium"
                  style={styles.rowTitle}
                  numberOfLines={1}
                >
                  {row.title}
                </AppText>
                <AppText
                  variant="small"
                  style={styles.rowMeta}
                  numberOfLines={1}
                >
                  {row.meta}
                </AppText>
              </View>
              <AppIcon
                name="ChevronRight"
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    loading: { alignItems: "center", justifyContent: "center" },
    hero: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.xl,
      borderBottomLeftRadius: Radius.xxl,
      borderBottomRightRadius: Radius.xxl,
      overflow: "hidden",
    },
    heroShade: {
      ...StyleSheet.absoluteFill,
      experimental_backgroundImage:
        "linear-gradient(170deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.45) 100%)",
    },
    ring: {
      position: "absolute",
      borderRadius: Radius.full,
      borderWidth: 1.5,
      borderColor: colors.onCardTrack,
    },
    ringLg: { width: 280, height: 280, top: -40, right: -110 },
    ringMd: { width: 170, height: 170, top: 20, right: -40 },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: Radius.full,
      backgroundColor: colors.cardTile,
      alignItems: "center",
      justifyContent: "center",
    },
    heroRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginTop: Spacing.lg,
      gap: Spacing.md,
    },
    heroText: { flex: 1 },
    artTile: {
      width: 104,
      height: 104,
      borderRadius: Radius.md,
      backgroundColor: colors.cardTile,
      alignItems: "center",
      justifyContent: "center",
      transform: [{ rotate: "-8deg" }],
      shadowColor: colors.shadow,
      shadowOpacity: 0.4,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    },
    title: { color: colors.onCard },
    tagline: { color: colors.onCardMuted, marginTop: Spacing.xs },
    sectionHeader: {
      paddingHorizontal: Spacing.sm,
      marginBottom: Spacing.sm,
      gap: Spacing.xxs,
    },
    sectionTitle: { color: colors.text },
    sectionSubtitle: { color: colors.textSecondary },
    list: {
      paddingHorizontal: Spacing.sm,
      paddingTop: Spacing.lg,
      gap: Spacing.xxs,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.md,
    },
    rowArt: {
      width: 52,
      height: 52,
      borderRadius: Radius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    rowText: { flex: 1 },
    rowTitle: { color: colors.text },
    rowMeta: { color: colors.textSecondary, marginTop: 2 },
  });

export default SubjectDetailScreen;
