import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import { useEffect, useState } from "react";
import {
  type LayoutChangeEvent,
  Pressable,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export type SegmentOption<T extends string | number> = {
  label: string;
  value: T;
};

interface AppSegmentedControlProps<T extends string | number> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
}

const PADDING = Spacing.xs;

/** Reusable segmented control (e.g. Class 11 / Class 12) for audio, MCQ & keywords. */
const AppSegmentedControl = <T extends string | number>({
  options,
  value,
  onChange,
  style,
}: AppSegmentedControlProps<T>) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [width, setWidth] = useState(0);
  const segmentWidth = options.length
    ? (width - PADDING * 2) / options.length
    : 0;
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withTiming(selectedIndex * segmentWidth, {
      duration: 220,
    });
  }, [selectedIndex, segmentWidth, translateX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const onLayout = (e: LayoutChangeEvent) =>
    setWidth(e.nativeEvent.layout.width);

  return (
    <View
      onLayout={onLayout}
      accessibilityRole="tablist"
      style={[styles.container, style]}
    >
      {width > 0 && (
        <Animated.View
          style={[styles.indicator, { width: segmentWidth }, indicatorStyle]}
        />
      )}
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => !selected && onChange(option.value)}
            style={styles.segment}
          >
            <AppText style={[styles.label, selected && styles.labelSelected]}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
};

/** Shared options for class switching across audio lectures, MCQ and keywords. */
export const CLASS_OPTIONS = [
  { label: "Class 11", value: 11 },
  { label: "Class 12", value: 12 },
] as const satisfies readonly SegmentOption<11 | 12>[];

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      borderRadius: Radius.md,
      padding: PADDING,
      backgroundColor: colors.border,
    },
    indicator: {
      position: "absolute",
      top: PADDING,
      bottom: PADDING,
      left: PADDING,
      borderRadius: Radius.sm,
      backgroundColor: colors.background,
    },
    segment: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: Spacing.sm,
    },
    label: {
      color: colors.text,
    },
    labelSelected: {
      color: colors.primary,
    },
  });

export default AppSegmentedControl;
