import { sendOtp } from "@/api/auth.api";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppText } from "@/components/ui/AppText";
import { mobileSchema } from "@/schema/auth.schema";
import { Radius, Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import { showToast } from "@/utils/toast";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Keyboard, Linking, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SendOtpScreen = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const { mutate: sendOtpMutation, isPending: isSendingOtp } = useMutation({
    mutationFn: sendOtp,

    onSuccess: (response) => {
      console.log("OTP sent successfully:", response);
      showToast({
        type: "success",
        title: "Success",
        message: response?.message ?? "OTP sent successfully",
      });

      // Navigate to OTP screen
      router.push({
        pathname: "/verify-otp",
        params: {
          phone,
        },
      });
    },

    onError: (error) => {
      // console.log("OTP failed:", error);
    },
  });

  const handleOnChange = (text: string) => {
    setPhone(text);

    if (error) {
      setError("");
    }
  };

  const handleSendOtp = () => {
    // Validate phone number
    const result = mobileSchema.safeParse({
      phone,
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid phone number");
      return;
    }

    // Hide keyboard
    Keyboard.dismiss();

    // Send OTP
    sendOtpMutation({
      phone,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppText variant="title" style={styles.title}>
          Welcome to Neet App
        </AppText>

        <View style={styles.inputRow}>
          <View style={styles.countryContainer}>
            <AppText style={styles.countryText}>🇮🇳</AppText>
            <AppText style={styles.countryText}>+91</AppText>
          </View>

          <AppInput
            containerStyle={styles.phoneInput}
            value={phone}
            placeholder="9876543210"
            onChangeText={handleOnChange}
            maxLength={10}
            error={error}
            keyboardType="number-pad"
          />
        </View>

        <AppButton
          size="large"
          loading={isSendingOtp}
          disabled={isSendingOtp}
          onPress={handleSendOtp}
          onLongPress={() => router.push("/complete-profile")}
        >
          Continue
        </AppButton>

        <AppText style={styles.termsText} variant="small">
          By continuing, you agree to our{" "}
          <AppText
            style={styles.termsLink}
            variant="link"
            onPress={() => Linking.openURL("https://example.com/terms")}
          >
            Terms
          </AppText>
          {" & "}
          <AppText
            style={styles.termsLink}
            variant="link"
            onPress={() =>
              Linking.openURL("https://example.com/privacy-policy")
            }
          >
            Privacy Policy
          </AppText>
          .
        </AppText>
      </View>

      <AppText style={styles.versionText}>VERSION : 1.0.0</AppText>
    </SafeAreaView>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      flex: 1,
      justifyContent: "center",
      gap: Spacing.xxxl,
      paddingHorizontal: Spacing.lg,
    },

    title: {
      color: colors.text,
      textAlign: "center",
      fontStyle: "italic",
    },

    inputRow: {
      flexDirection: "row",
      gap: Spacing.sm,
    },

    phoneInput: {
      flex: 1,
    },

    countryContainer: {
      height: Spacing.input,
      borderWidth: 1,
      borderRadius: Radius.md,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.xs,
      paddingHorizontal: Spacing.sm,
    },

    countryText: {
      color: colors.text,
    },

    termsText: {
      color: colors.text,
      textAlign: "center",
    },

    termsLink: {
      color: colors.primary,
      textDecorationLine: "underline",
    },

    versionText: {
      color: colors.text,
      textAlign: "center",
      opacity: 0.5,
    },
  });

export default SendOtpScreen;
