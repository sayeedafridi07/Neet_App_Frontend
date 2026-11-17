import { AppText } from "@/components/ui/AppText";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import { formatDuration } from "@/utils/duration";
import { useRef, useState } from "react";
import { type LayoutChangeEvent, type GestureResponderEvent, StyleSheet, View } from "react-native";

interface SeekBarProps {
  position: number;
  duration: number;
  onSeek: (seconds: number) => void;
}

const THUMB = 14;

/** Draggable / tappable progress bar. Shows the drag position while scrubbing and seeks on release. */
const SeekBar = ({ position, duration, onSeek }: SeekBarProps) => {
  const { colors } = useTheme();
  const width = useRef(0);
  const [scrub, setScrub] = useState<number | null>(null);

  const toSeconds = (e: GestureResponderEvent) => {
    if (!width.current || !duration) return 0;
    const ratio = Math.min(1, Math.max(0, e.nativeEvent.locationX / width.current));
    return ratio * duration;
  };

  const shown = scrub ?? position;
  const progress = duration > 0 ? Math.min(1, shown / duration) : 0;

  return (
    <View>
      <View
        style={styles.hitArea}
        onLayout={(e: LayoutChangeEvent) => (width.current = e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => duration > 0}
        onMoveShouldSetResponder={() => duration > 0}
        onResponderTerminationRequest={() => false}
        onResponderGrant={(e) => setScrub(toSeconds(e))}
        onResponderMove={(e) => setScrub(toSeconds(e))}
        onResponderRelease={(e) => {
          onSeek(toSeconds(e));
          setScrub(null);
        }}
        onResponderTerminate={() => setScrub(null)}
      >
        <View pointerEvents="none" style={[styles.track, { backgroundColor: colors.border }]}>
          <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
        </View>
        <View
          pointerEvents="none"
          style={[
            styles.thumb,
            {
              left: `${progress * 100}%`,
              backgroundColor: colors.primary,
              transform: [{ translateX: -THUMB / 2 }, { scale: scrub !== null ? 1.3 : 1 }],
            },
          ]}
        />
      </View>
      <View style={styles.times}>
        <AppText variant="small" style={{ color: colors.textSecondary }}>
          {formatDuration(shown)}
        </AppText>
        <AppText variant="small" style={{ color: colors.textSecondary }}>
          -{formatDuration(Math.max(0, duration - shown))}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  hitArea: { height: 28, justifyContent: "center" },
  track: { height: 4, borderRadius: 2, overflow: "hidden" },
  fill: { height: 4 },
  thumb: { position: "absolute", width: THUMB, height: THUMB, borderRadius: THUMB / 2 },
  times: { flexDirection: "row", justifyContent: "space-between", marginTop: Spacing.xxs },
});

export default SeekBar;
