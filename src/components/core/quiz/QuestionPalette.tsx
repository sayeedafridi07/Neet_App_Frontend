import AppIcon from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import { Radius, ScreenWidth, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import {
  QUIZ_ANSWER_STATUS,
  type QuizPaletteStatus,
  type QuizQuestionResult,
} from "@/types";
import { FlatList, Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Distinct from "Marked" (warning) so answered+marked needs no dot.
export const ANSWERED_MARKED = "#7C3AED";

type Colors = ReturnType<typeof useTheme>["colors"];
type PaletteCellStatus = QuizPaletteStatus | QuizQuestionResult;

interface QuestionPaletteProps {
  visible: boolean;
  onClose: () => void;
  /** one status per question, in display order */
  statuses: PaletteCellStatus[];
  /** -1 when nothing is "current" (review list) */
  currentIndex: number;
  onSelect: (index: number) => void;
  /** "attempt" while answering, "review" after submission */
  mode?: "attempt" | "review";
}

const COLUMNS = 5;
const GRID_GAP = Spacing.lg;
const SIDE_PADDING = Spacing.lg;
const BOX_SIZE = Math.floor(
  (ScreenWidth - SIDE_PADDING * 2 - GRID_GAP * (COLUMNS - 1)) / COLUMNS,
);

interface CellStyle {
  bg: string;
  border: string;
  text: string;
}

/** Same colours as the guide on the instructions screen. */
export const getStatusStyle = (
  status: PaletteCellStatus,
  colors: Colors,
): CellStyle => {
  switch (status) {
    case QUIZ_ANSWER_STATUS.ANSWERED:
    case "CORRECT":
      return { bg: colors.success, border: colors.success, text: colors.onPrimary };
    case QUIZ_ANSWER_STATUS.NOT_ANSWERED:
    case "WRONG":
      return { bg: colors.error, border: colors.error, text: colors.onPrimary };
    case QUIZ_ANSWER_STATUS.MARKED:
      return { bg: colors.warning, border: colors.warning, text: colors.onPrimary };
    case QUIZ_ANSWER_STATUS.MARKED_AND_ANSWERED:
      return { bg: ANSWERED_MARKED, border: ANSWERED_MARKED, text: colors.onPrimary };
    case "SKIPPED":
      return { bg: colors.surface, border: colors.border, text: colors.textSecondary };
    default: // NOT_VISITED
      return { bg: colors.background, border: colors.border, text: colors.text };
  }
};

const getLegend = (mode: "attempt" | "review", colors: Colors) => {
  const items: { key: PaletteCellStatus; label: string }[] =
    mode === "review"
      ? [
          { key: "CORRECT", label: "Correct" },
          { key: "WRONG", label: "Wrong" },
          { key: "SKIPPED", label: "Skipped" },
        ]
      : [
          { key: "NOT_VISITED", label: "Not visited" },
          { key: QUIZ_ANSWER_STATUS.ANSWERED, label: "Answered" },
          { key: QUIZ_ANSWER_STATUS.NOT_ANSWERED, label: "Not answered" },
          { key: QUIZ_ANSWER_STATUS.MARKED, label: "Marked for review" },
          {
            key: QUIZ_ANSWER_STATUS.MARKED_AND_ANSWERED,
            label: "Answered & marked",
          },
        ];
  return items.map((i) => ({ ...i, style: getStatusStyle(i.key, colors) }));
};

const QuestionPalette = ({
  visible,
  onClose,
  statuses,
  currentIndex,
  onSelect,
  mode = "attempt",
}: QuestionPaletteProps) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);
  const legend = getLegend(mode, colors);

  const counts = statuses.reduce<Partial<Record<PaletteCellStatus, number>>>(
    (acc, s) => ({ ...acc, [s]: (acc[s] ?? 0) + 1 }),
    {},
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close palette"
        />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <AppText variant="subtitle" style={styles.text}>
              {mode === "review" ? "Answers Palette" : "Question Palette"}
            </AppText>
            <Pressable
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={8}
              accessibilityLabel="Close palette"
            >
              <AppIcon name="X" size={20} color={colors.primary} />
            </Pressable>
          </View>

          {/* LEGEND */}
          <View style={styles.legend}>
            {legend.map((item) => (
              <View key={item.key} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    {
                      backgroundColor: item.style.bg,
                      borderColor: item.style.border,
                    },
                  ]}
                >
                  <AppText variant="smallBold" style={{ color: item.style.text }}>
                    {counts[item.key] ?? 0}
                  </AppText>
                </View>
                <AppText variant="caption" style={styles.legendLabel}>
                  {item.label}
                </AppText>
              </View>
            ))}
          </View>

          {/* GRID */}
          <FlatList
            data={statuses}
            numColumns={COLUMNS}
            keyExtractor={(_, index) => String(index)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.grid,
              { paddingBottom: Spacing.lg + insets.bottom },
            ]}
            columnWrapperStyle={styles.gridRow}
            initialNumToRender={50}
            renderItem={({ item, index }) => {
              const s = getStatusStyle(item, colors);
              const isCurrent = index === currentIndex;
              return (
                <Pressable
                  onPress={() => {
                    onSelect(index);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.box,
                    { backgroundColor: s.bg, borderColor: s.border },
                    isCurrent && styles.currentBox,
                    pressed && styles.pressed,
                  ]}
                  accessibilityLabel={`Question ${index + 1}`}
                  accessibilityState={{ selected: isCurrent }}
                >
                  <AppText variant="smallBold" style={{ color: s.text }}>
                    {index + 1}
                  </AppText>
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: colors.overlay,
    },
    sheet: {
      maxHeight: "70%",
      backgroundColor: colors.background,
      borderTopLeftRadius: Radius.lg,
      borderTopRightRadius: Radius.lg,
    },
    text: { color: colors.text },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: SIDE_PADDING,
      paddingBottom: Spacing.xxl,
    },
    closeBtn: {
      padding: Spacing.xs,
      borderRadius: Radius.full,
      backgroundColor: colors.surface,
    },

    legend: {
      flexDirection: "row",
      flexWrap: "wrap",
      rowGap: Spacing.md,
      paddingHorizontal: SIDE_PADDING,
      paddingBottom: Spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    legendItem: {
      width: "50%",
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
    },
    legendDot: {
      width: 36,
      height: 36,
      borderRadius: Radius.sm,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
    },
    legendLabel: { color: colors.text, flex: 1 },

    grid: { padding: SIDE_PADDING },
    gridRow: { gap: GRID_GAP },
    box: {
      width: BOX_SIZE,
      height: BOX_SIZE,
      borderRadius: Radius.sm,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: Spacing.md,
    },
    currentBox: { borderWidth: 2, borderColor: colors.text },
    pressed: { opacity: 0.7 },
  });

export default QuestionPalette;
