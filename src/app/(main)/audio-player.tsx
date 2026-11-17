import SeekBar from "@/components/core/audio/SeekBar";
import { AppText } from "@/components/ui/AppText";
import { LECTURE_FALLBACK_IMAGE } from "@/data/audioLectures";
import type { AudioLecture } from "@/types";
import { SKIP_SECONDS, useAudioPlayer } from "@/hooks/useAudioPlayer";
import { Radius, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronDown,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react-native";
import { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Colors = ReturnType<typeof useTheme>["colors"];

const close = () => (router.canGoBack() ? router.back() : router.replace("/"));

const AudioPlayerScreen = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { width } = useWindowDimensions();
  const coverSize = Math.min(width - Spacing.xxxl * 2, 340);

  const params = useLocalSearchParams<{ lecture?: string; source?: string }>();
  const lecture = useMemo<AudioLecture | null>(() => {
    try {
      return params.lecture ? JSON.parse(params.lecture) : null;
    } catch {
      return null;
    }
  }, [params.lecture]);
  const source = params.source === "keyword" ? "keyword" : "lecture";

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
          <ChevronDown size={28} color={colors.text} />
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
            {isBuffering && (
              <ActivityIndicator
                color={colors.onPrimary}
                style={styles.buffering}
              />
            )}
          </View>
        )}

        {/* Title */}
        <View style={styles.titleBlock}>
          <AppText
            variant="title"
            numberOfLines={isKeyword ? undefined : 2}
            style={styles.title}
          >
            {lecture.title}
          </AppText>
          {!!lecture.description && (
            <AppText variant="default" style={styles.description}>
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

          <Pressable
            onPress={() => skip(-SKIP_SECONDS)}
            hitSlop={8}
            style={styles.iconBtn}
          >
            <RotateCcw size={26} color={colors.textSecondary} />
          </Pressable>

          <Pressable
            onPress={togglePlay}
            style={({ pressed }) => [
              styles.playBtn,
              pressed && { transform: [{ scale: 0.95 }] },
            ]}
          >
            {isPlaying ? (
              <Pause
                size={26}
                color={colors.onPrimary}
                fill={colors.onPrimary}
              />
            ) : (
              <Play
                size={26}
                color={colors.onPrimary}
                fill={colors.onPrimary}
                style={{ marginLeft: 3 }}
              />
            )}
          </Pressable>

          <Pressable
            onPress={() => skip(SKIP_SECONDS)}
            hitSlop={8}
            style={styles.iconBtn}
          >
            <RotateCw size={26} color={colors.textSecondary} />
          </Pressable>

          <Pressable onPress={toggleMute} hitSlop={8} style={styles.iconBtn}>
            {muted ? (
              <VolumeX size={24} color={colors.textSecondary} />
            ) : (
              <Volume2 size={24} color={colors.textSecondary} />
            )}
          </Pressable>
        </View>
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
    buffering: { position: "absolute", bottom: Spacing.lg },
    titleBlock: { gap: Spacing.xs },
    title: { color: colors.text },
    description: { color: colors.textSecondary },
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
