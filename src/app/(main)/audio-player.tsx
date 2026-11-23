import AudioLectureCard from "@/components/core/audio/AudioLectureCard";
import SeekBar from "@/components/core/audio/SeekBar";
import AppIcon from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import { LECTURE_FALLBACK_IMAGE } from "@/constants";
import { SKIP_SECONDS, useAudioPlayer } from "@/hooks/useAudioPlayer";
import { Radius, ScreenHeight, ScreenWidth, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import type { AudioLecture } from "@/types";
import { formatTotalDuration } from "@/utils/duration";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Colors = ReturnType<typeof useTheme>["colors"];

const close = () => (router.canGoBack() ? router.back() : router.replace("/"));

const AudioPlayerScreen = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const coverSize = Math.min(ScreenWidth - Spacing.xxxl * 2, 340);

  const params = useLocalSearchParams<{
    lecture?: string;
    playlist?: string;
    source?: string;
  }>();

  const initialLecture = useMemo<AudioLecture | null>(() => {
    try {
      return params.lecture ? JSON.parse(params.lecture) : null;
    } catch {
      return null;
    }
  }, [params.lecture]);

  const playlist = useMemo<AudioLecture[]>(() => {
    try {
      return params.playlist ? JSON.parse(params.playlist) : [];
    } catch {
      return [];
    }
  }, [params.playlist]);

  const source = params.source === "keyword" ? "keyword" : "lecture";

  // Position in the playlist; -1 when the lecture isn't part of one
  const [index, setIndex] = useState(() =>
    playlist.findIndex((l) => l.id === initialLecture?.id),
  );
  const lecture = index >= 0 ? playlist[index] : initialLecture;
  const hasPrev = index > 0;
  const hasNext = index >= 0 && index < playlist.length - 1;

  const {
    isPlaying,
    isBuffering,
    position,
    duration,
    rate,
    muted,
    togglePlay,
    skip,
    seekTo,
    cycleRate,
    toggleMute,
  } = useAudioPlayer(lecture);

  // No lecture passed (e.g. deep link) → go back
  useEffect(() => {
    if (!lecture) close();
  }, [lecture]);
  if (!lecture) return null;

  const isKeyword = source === "keyword";

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={close} hitSlop={10} style={styles.iconBtn}>
          <AppIcon name="ChevronDown" size={28} color={colors.text} />
        </Pressable>
        <View style={{ alignItems: "center" }}>
          <AppText variant="caption" style={styles.eyebrow}>
            PLAYING FROM
          </AppText>
          <AppText variant="smallBold" style={styles.text}>
            {isKeyword ? "Keywords Revision" : "Audio Lecture"}
          </AppText>
        </View>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover art (hidden for keywords) */}
        {!isKeyword && (
          <View style={[styles.cover, { width: coverSize, height: coverSize }]}>
            <Image
              source={lecture.imageUrl ?? LECTURE_FALLBACK_IMAGE}
              style={[StyleSheet.absoluteFill, { borderRadius: Radius.lg }]}
              contentFit="cover"
              transition={200}
            />
          </View>
        )}

        {/* Title */}
        <View style={isKeyword ? styles.keywordBlock : styles.titleBlock}>
          {isKeyword ? (
            <ScrollView
              style={styles.keywordTitleBox}
              contentContainerStyle={styles.keywordTitleContent}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AppText variant="heading" style={styles.keywordTitle}>
                  {lecture.title}
                </AppText>
              </View>
            </ScrollView>
          ) : (
            <AppText variant="title" style={styles.title}>
              {lecture.title}
            </AppText>
          )}
          {!!lecture.description && (
            <AppText
              variant="cardTitle"
              numberOfLines={2}
              style={[styles.description, isKeyword && { textAlign: "center" }]}
            >
              {lecture.description}
            </AppText>
          )}
        </View>

        {/* Seek */}
        <SeekBar position={position} duration={duration} onSeek={seekTo} />

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable onPress={cycleRate} hitSlop={8} style={styles.iconBtn}>
            <AppText variant="smallBold" style={styles.secondaryText}>
              {rate}x
            </AppText>
          </Pressable>

          {isKeyword ? (
            <Pressable
              onPress={() => setIndex((i) => i - 1)}
              disabled={!hasPrev}
              hitSlop={8}
              style={[styles.iconBtn, !hasPrev && styles.disabled]}
            >
              <AppIcon
                name="SkipBack"
                size={26}
                color={colors.textSecondary}
                fill={colors.textSecondary}
              />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => skip(-SKIP_SECONDS)}
              hitSlop={8}
              style={styles.iconBtn}
            >
              <AppIcon
                name="RotateCcw"
                size={26}
                color={colors.textSecondary}
              />
            </Pressable>
          )}

          <Pressable
            onPress={togglePlay}
            style={({ pressed }) => [
              styles.playBtn,
              pressed && { transform: [{ scale: 0.95 }] },
            ]}
          >
            {isBuffering ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : isPlaying ? (
              <AppIcon
                name="Pause"
                size={26}
                color={colors.onPrimary}
                fill={colors.onPrimary}
              />
            ) : (
              <AppIcon
                name="Play"
                size={26}
                color={colors.onPrimary}
                fill={colors.onPrimary}
                style={{ marginLeft: 3 }}
              />
            )}
          </Pressable>

          {isKeyword ? (
            <Pressable
              onPress={() => setIndex((i) => i + 1)}
              disabled={!hasNext}
              hitSlop={8}
              style={[styles.iconBtn, !hasNext && styles.disabled]}
            >
              <AppIcon
                name="SkipForward"
                size={26}
                color={colors.textSecondary}
                fill={colors.textSecondary}
              />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => skip(SKIP_SECONDS)}
              hitSlop={8}
              style={styles.iconBtn}
            >
              <AppIcon name="RotateCw" size={26} color={colors.textSecondary} />
            </Pressable>
          )}

          <Pressable onPress={toggleMute} hitSlop={8} style={styles.iconBtn}>
            {muted ? (
              <AppIcon name="VolumeX" size={24} color={colors.textSecondary} />
            ) : (
              <AppIcon name="Volume2" size={24} color={colors.textSecondary} />
            )}
          </Pressable>
        </View>

        {/* Queue: same card look as the keyword list, playing item in green */}
        {playlist.length > 1 && (
          <View style={styles.queueCard}>
            <View style={styles.queueHeader}>
              <AppText variant="cardTitle" style={styles.queueTitle}>
                Up next
              </AppText>
              <AppText variant="caption" style={styles.queueMeta}>
                {index + 1} of {playlist.length} •{" "}
                {formatTotalDuration(
                  playlist.reduce((sum, l) => sum + l.duration, 0),
                )}
              </AppText>
            </View>
            <View style={styles.queueDivider} />
            {playlist.map((item, i) => (
              <Fragment key={item.id}>
                {i > 0 && <View style={styles.queueRowDivider} />}
                <View style={styles.queueRow}>
                  <AudioLectureCard
                    lecture={item}
                    active={i === index}
                    onPress={() => setIndex(i)}
                  />
                </View>
              </Fragment>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1 },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Spacing.md,
      height: 56,
    },
    eyebrow: { color: colors.textMuted, letterSpacing: 1 },
    text: { color: colors.text },
    content: {
      paddingHorizontal: Spacing.xxl,
      paddingBottom: Spacing.section,
      gap: Spacing.xl,
    },
    cover: {
      alignSelf: "center",
      marginTop: Spacing.md,
      borderRadius: Radius.lg,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 12,
    },
    disabled: { opacity: 0.35 },
    titleBlock: { gap: Spacing.xs },
    queueCard: {
      marginTop: Spacing.lg,
      borderRadius: Radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.background,
      shadowColor: colors.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    queueHeader: {
      gap: Spacing.xxs,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      backgroundColor: colors.surface,
      borderTopLeftRadius: Radius.lg,
      borderTopRightRadius: Radius.lg,
    },
    queueTitle: { color: colors.text },
    queueMeta: { color: colors.textSecondary },
    queueDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
    queueRow: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
    queueRowDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginLeft: Spacing.lg + 42 + Spacing.md,
    },
    keywordBlock: { gap: Spacing.lg },
    keywordTitleBox: {
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderRadius: Radius.lg,
      maxHeight: ScreenHeight * 0.5,
      minHeight: ScreenHeight * 0.5,
    },
    keywordTitleContent: {
      paddingVertical: Spacing.xl,
      paddingHorizontal: Spacing.lg,
    },
    keywordTitle: { color: colors.text, flex: 1 },
    title: { color: colors.text },
    description: { color: colors.text },
    controls: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    iconBtn: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryText: { color: colors.textSecondary },
    playBtn: {
      width: 60,
      height: 60,
      borderRadius: Radius.full,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 6,
    },
  });

export default AudioPlayerScreen;
