import AppIcon from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

interface QuizTimerProps {
  /** Local epoch ms when the attempt ends (derived from server remainingSeconds). */
  deadline: number;
  onExpire?: () => void;
}

const WARNING_SECONDS = 5 * 60;

const format = (totalSeconds: number) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
};

const QuizTimer = ({ deadline, onExpire }: QuizTimerProps) => {
  const { colors } = useTheme();
  const [now, setNow] = useState(() => Date.now());
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Computed from wall-clock time, so it stays correct after backgrounding.
  const remaining = (deadline - now) / 1000;

  useEffect(() => {
    if (remaining <= 0 && !expiredRef.current) {
      expiredRef.current = true;
      onExpireRef.current?.();
    }
  }, [remaining]);

  const seconds = remaining;
  const isLow = remaining <= WARNING_SECONDS;
  const tint = isLow ? colors.error : colors.primary;

  return (
    <View
      style={[styles.container, { borderColor: tint }]}
      accessibilityLabel={`Time left ${format(seconds)}`}
    >
      <AppIcon name="Timer" size={16} color={tint} />
      <AppText variant="smallBold" style={{ color: tint, fontVariant: ["tabular-nums"] }}>
        {format(seconds)}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
});

export default QuizTimer;
