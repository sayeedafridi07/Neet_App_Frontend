import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Radius, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import { Image } from "expo-image";
import { router } from "expo-router";
import { type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";

const EARPHONE_IMAGE = require("../../../assets/icons/earphone.svg");
const CROWN_IMAGE = require("../../../assets/images/crown.png");

interface PremiumBannerProps {
  title: string;
  description: string;
  ctaLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/** Upsell card shown above content that belongs to a premium class. */
const PremiumBanner = ({
  title,
  description,
  ctaLabel = "Explore Premium",
  style,
}: PremiumBannerProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={[styles.card, style]}>
      <View style={styles.eyebrow}>
        <Image source={CROWN_IMAGE} style={styles.crown} contentFit="contain" />
        <AppText variant="smallBold" style={styles.eyebrowText}>
          PREMIUM ACCESS
        </AppText>
      </View>

      <View style={styles.body}>
        <View style={styles.copy}>
          <AppText variant="subtitle" style={styles.title}>
            {title}
          </AppText>
          <AppText variant="small" style={styles.description}>
            {description}
          </AppText>
        </View>
        <View style={styles.art}>
          <Image
            source={EARPHONE_IMAGE}
            style={styles.artImage}
            contentFit="contain"
          />
        </View>
      </View>

      <AppButton onPress={() => router.push("/subscription")} style={styles.cta}>
        {ctaLabel}
      </AppButton>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    card: {
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      gap: Spacing.md,
      backgroundColor: colors.primary + "1A",
    },
    artImage: { width: 48, height: 48 },
    crown: { width: 24, height: 24 },
    eyebrow: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
    eyebrowText: { color: colors.primary, letterSpacing: 0.5 },
    body: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
    copy: { flex: 1, gap: Spacing.xs },
    title: { color: colors.text },
    description: { color: colors.textSecondary },
    art: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary + "26",
    },
    cta: { borderRadius: Radius.full },
  });

export default PremiumBanner;
