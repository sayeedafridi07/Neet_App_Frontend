import {
  createSubscriptionOrder,
  getSubscriptionPlans,
  verifySubscriptionPayment,
} from "@/api/subscription.api";
import PlanCard from "@/components/core/premium/PlanCard";
import { AppButton } from "@/components/ui/AppButton";
import AppIcon from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import { useAuthStore } from "@/store/authStore";
import { Colors, Radius, Spacing } from "@/theme";
import type {
  CreateOrderData,
  RazorpaySuccessPayload,
  SubscriptionPlan,
} from "@/types";
import { formatDate, formatPrice } from "@/utils/format";
import { showToast } from "@/utils/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BG_IMAGE =
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80";

const colors = Colors.dark;

const BENEFITS = [
  "Every audio lecture, Class 11 & 12",
  "Unlimited chapter-wise MCQ practice",
  "High-yield NCERT keyword revisions",
  "Track weak chapters and progress",
];

// Spotify-style fine print for the selected plan.
const footerText = (plan: SubscriptionPlan) => {
  const price = formatPrice(plan.price, plan.currency);
  const access =
    plan.validityType === "FIXED_DATE" && plan.expiresAt
      ? `access until ${formatDate(plan.expiresAt)}`
      : plan.durationDays
        ? `${plan.durationDays} days of access`
        : "full access";
  const offerLive =
    plan.originalPrice != null &&
    plan.originalPrice > plan.price &&
    (!plan.offerValidTill || new Date(plan.offerValidTill) > new Date());
  const parts = [`${price} one-time payment for ${access}. No auto-renewal.`];
  if (offerLive) {
    parts.push(
      `Regular price ${formatPrice(plan.originalPrice!, plan.currency)}` +
        (plan.offerValidTill
          ? `. Offer ends ${formatDate(plan.offerValidTill)}.`
          : "."),
    );
  }
  return parts.join(" ");
};

/* ---------------------------------- Screen ---------------------------------- */

const SubscriptionScreen = () => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const plansQuery = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: getSubscriptionPlans,
  });

  const plans = plansQuery.data?.data?.plans ?? [];

  const [pickedId, setSelectedId] = useState<string>();
  // Default to the first plan until the user picks one.
  const selectedPlan = plans.find((p) => p.id === pickedId) ?? plans[0];
  const selectedId = selectedPlan?.id;

  const createOrder = useMutation({
    mutationFn: (planId: string) => createSubscriptionOrder(planId),
    onSuccess: (res) => {
      if (res.success && res.data) openCheckout(res.data);
      else
        showToast({
          type: "error",
          message: res.message || "Could not start payment",
        });
    },
    onError: () =>
      showToast({ type: "error", message: "Could not start payment" }),
  });

  const verify = useMutation({
    mutationFn: verifySubscriptionPayment,
    onSuccess: (res) => {
      if (!res.success) {
        showToast({
          type: "error",
          message: res.message || "Payment verification failed",
        });
        return;
      }
      queryClient.invalidateQueries();
      showToast({
        type: "success",
        title: "Welcome to Premium",
        message: "Everything is unlocked.",
      });
      router.back();
    },
    onError: () =>
      showToast({
        type: "error",
        message:
          "We couldn't confirm your payment. If you were charged, it will reflect shortly.",
      }),
  });

  const openCheckout = async (order: CreateOrderData) => {
    const plan = selectedPlan;
    if (!plan) return;
    try {
      const payload: RazorpaySuccessPayload = await RazorpayCheckout.open({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: "Gemineet",
        description: plan.name,
        prefill: { name: user?.name ?? undefined, contact: user?.phone },
        theme: { color: colors.primary },
      });
      verify.mutate({
        razorpayOrderId: payload.razorpay_order_id,
        razorpayPaymentId: payload.razorpay_payment_id,
        razorpaySignature: payload.razorpay_signature,
      });
    } catch (e: any) {
      // code 0 / 2 = user cancelled; don't treat as an error.
      if (e?.code === 0 || e?.code === 2) return;
      showToast({
        type: "error",
        message: e?.description || "Payment failed. Please try again.",
      });
    }
  };

  const busy = createOrder.isPending || verify.isPending;
  const loading = plansQuery.isLoading;

  // iOS modal is a sheet below the status bar, so it needs no top inset.
  const topInset = Platform.OS === "ios" ? 0 : insets.top;

  return (
    <ImageBackground
      source={{ uri: BG_IMAGE }}
      style={styles.container}
      resizeMode="cover"
    >
      <LinearGradient
        colors={[colors.overlay, colors.overlay, colors.background]}
        locations={[0, 0.25, 0.5]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View
        style={[
          styles.content,
          {
            paddingTop: topInset + Spacing.xl,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Close"
          style={({ pressed }) => [styles.close, pressed && styles.pressed]}
        >
          <AppIcon name="X" size={20} color={colors.onCard} />
        </Pressable>

        <View style={styles.hero}>
          <View style={styles.brandRow}>
            <AppText variant="display" style={styles.onPhoto}>
              Gemineet
            </AppText>
            <View style={styles.proTag}>
              <AppText variant="subtitle" style={styles.onPhoto}>
                pro
              </AppText>
            </View>
          </View>
          <AppText variant="default" style={styles.heroSub}>
            Unlock everything you need to crack NEET
          </AppText>
        </View>

        <View style={styles.flex} />

        <View style={styles.benefits}>
          {BENEFITS.map((b) => (
            <View key={b} style={styles.benefit}>
              <AppIcon
                name="Check"
                size={20}
                color={colors.primary}
                strokeWidth={2.5}
              />
              <AppText variant="default" style={[styles.onPhoto, styles.flex]}>
                {b}
              </AppText>
            </View>
          ))}
        </View>

        <>
          {loading ? (
            <ActivityIndicator
              color={colors.primary}
              style={styles.plansState}
            />
          ) : plansQuery.isError || !plans.length ? (
            <Pressable
              onPress={() => plansQuery.refetch()}
              style={styles.errorBox}
            >
              <AppText variant="small" style={styles.mutedText}>
                Couldn&apos;t load plans. Tap to retry.
              </AppText>
            </Pressable>
          ) : (
            <View style={styles.plans}>
              {plans.map((p) => (
                <PlanCard
                  key={p.id}
                  plan={p}
                  selected={p.id === selectedId}
                  onPress={() => setSelectedId(p.id)}
                />
              ))}
            </View>
          )}

          <AppButton
            size="large"
            loading={busy}
            disabled={!selectedPlan}
            onPress={() => selectedPlan && createOrder.mutate(selectedPlan.id)}
            style={styles.cta}
          >
            {selectedPlan
              ? `Subscribe · ${formatPrice(selectedPlan.price, selectedPlan.currency)}`
              : "Subscribe"}
          </AppButton>

          {selectedPlan && (
            <AppText variant="small" style={styles.footer}>
              {footerText(selectedPlan)}
            </AppText>
          )}
          <View style={styles.secureRow}>
            <AppIcon name="Lock" size={12} color={colors.textMuted} />
            <AppText variant="small" style={styles.secureText}>
              Secure payments powered by Razorpay
            </AppText>
          </View>
        </>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  pressed: { opacity: 0.8 },
  content: { flex: 1, paddingHorizontal: Spacing.lg },

  close: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.onCardTrack,
  },

  hero: { alignItems: "center", marginTop: Spacing.md, gap: Spacing.sm },
  brandRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  proTag: {
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.onCard,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.xs,
  },
  onPhoto: { color: colors.onCard },
  heroSub: {
    color: colors.onCardMuted,
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },

  benefits: { gap: Spacing.md, marginBottom: Spacing.xl },
  benefit: { flexDirection: "row", alignItems: "center", gap: Spacing.md },

  plans: { gap: Spacing.sm },
  plansState: { height: 120 },
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
  mutedText: { color: colors.textSecondary },

  errorBox: {
    height: 120,
    borderRadius: Radius.lg,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  cta: { marginTop: Spacing.lg, backgroundColor: colors.primary },
  footer: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.sm,
  },
  secureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  secureText: { color: colors.textMuted },
});

export default SubscriptionScreen;
