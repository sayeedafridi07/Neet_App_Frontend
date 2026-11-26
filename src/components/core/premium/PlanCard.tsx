import AppIcon from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import { Colors, Radius, Spacing } from "@/theme";
import type { SubscriptionPlan } from "@/types";
import { formatDate, formatPrice } from "@/utils/format";
import { Pressable, StyleSheet, View } from "react-native";

// Sits on the paywall's dark fade, so it always uses the dark palette.
const colors = Colors.dark;

const perMonth = (plan: SubscriptionPlan) => {
  if (plan.validityType !== "DURATION" || !plan.durationDays) return null;
  const months = Math.round(plan.durationDays / 30);
  return months > 1
    ? `${formatPrice(Math.round(plan.price / months), plan.currency)}/mo`
    : null;
};

const validityLabel = (plan: SubscriptionPlan) => {
  if (plan.validityType === "FIXED_DATE" && plan.expiresAt)
    return `Valid till ${formatDate(plan.expiresAt)}`;
  if (plan.durationDays) {
    const d = plan.durationDays;
    if (d % 365 === 0) return `${d / 365} year${d > 365 ? "s" : ""} access`;
    if (d % 30 === 0) return `${d / 30} month${d > 30 ? "s" : ""} access`;
    return `${d} days access`;
  }
  return "One-time payment";
};

const offerEndsLabel = (iso: string) => `Offer ends ${formatDate(iso)}`;

type PlanCardProps = {
  plan: SubscriptionPlan;
  selected: boolean;
  onPress: () => void;
};

const PlanCard = ({ plan, selected, onPress }: PlanCardProps) => {
  const offerLive =
    !plan.offerValidTill || new Date(plan.offerValidTill) > new Date();
  const savings =
    offerLive && plan.originalPrice && plan.originalPrice > plan.price
      ? plan.originalPrice - plan.price
      : 0;
  const monthly = perMonth(plan);
  const offerText =
    savings > 0 && plan.offerValidTill ? offerEndsLabel(plan.offerValidTill) : null;
  const tint = selected ? styles.selectedText : styles.planText;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      style={({ pressed }) => [
        styles.plan,
        selected && styles.planSelected,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected && (
          <AppIcon
            name="Check"
            size={13}
            color={colors.onPrimary}
            strokeWidth={3.5}
          />
        )}
      </View>

      <View style={styles.flex}>
        {offerText && (
          <View style={styles.offerTag}>
            <AppText variant="overline" style={styles.offerTagText}>
              {offerText}
            </AppText>
          </View>
        )}
        <AppText variant="bodyMedium" style={tint} numberOfLines={1}>
          {plan.name}
        </AppText>
        <AppText variant="small" style={styles.mutedText}>
          {monthly ? `${validityLabel(plan)} · ${monthly}` : validityLabel(plan)}
        </AppText>
      </View>

      <View style={styles.priceCol}>
        <AppText variant="cardTitle" style={tint}>
          {formatPrice(plan.price, plan.currency)}
        </AppText>
        {savings > 0 && plan.originalPrice != null && (
          <AppText variant="small" style={styles.strike}>
            {formatPrice(plan.originalPrice, plan.currency)}
          </AppText>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.8 },
  plan: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  planSelected: { borderColor: colors.primary },
  planText: { color: colors.text },
  selectedText: { color: colors.primary },
  mutedText: { color: colors.textSecondary },
  radio: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  priceCol: { alignItems: "flex-end", gap: Spacing.xxs },
  offerTag: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    backgroundColor: colors.primary,
    marginBottom: Spacing.xs,
  },
  offerTagText: { color: colors.onPrimary },
  strike: {
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
});

export default PlanCard;
