import { sendOtp, verifyOtp } from "@/api/auth.api";
import { AppText } from "@/components/ui/AppText";
import AppTopBar from "@/components/ui/AppTopBar";
import { useAuthStore } from "@/store/authStore";
import { Spacing, Typography } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import { showToast } from "@/utils/toast";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { OtpInput, type OtpInputRef } from "react-native-otp-entry";
import { SafeAreaView } from "react-native-safe-area-context";

const OTP_DURATION = 10;

const VerifyOtpScreen = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const { setToken, setUser } = useAuthStore((state) => state);
  const { phone } = useLocalSearchParams<{
    phone: string;
  }>();
  const otpInputRef = useRef<OtpInputRef>(null);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(OTP_DURATION);

  // --------------------------------
  // Verify OTP
  // --------------------------------

  const { mutate: verifyOtpMutation, isPending: isVerifyingOtp } = useMutation({
    mutationFn: verifyOtp,

    onSuccess: (response) => {
      const isProfileComplete = response?.data?.user?.profileComplete ?? false;

      if (isProfileComplete) {
        setToken(response?.data?.accessToken ?? null);
        setUser(response?.data?.user ?? null);
        showToast({
          type: "success",
          title: "Success",
          message: response?.message ?? "OTP verified successfully",
        });
      } else {
        setToken(response?.data?.accessToken ?? null);
        router.replace({
          pathname: "/complete-profile",
          params: {
            data: JSON.stringify(response?.data),
          },
        });
        showToast({
          type: "success",
          title: "Success",
          message: response?.message ?? "OTP verified successfully",
        });
      }
      // setToken(userData.token);
      // setUser(userData);
      //
      // Or:
      //
      // router.replace({
      //   pathname: "/register",
      //   params: {
      //     data: JSON.stringify(userData),
      //   },
      // });
    },

    onError: (error) => {
      console.log("Verify OTP Error:", error);
      setOtp("");
      setError(error?.data?.message ?? "Invalid OTP. Please try again.");
      showToast({
        type: "error",
        title: "Error",
        message: error?.data?.message ?? "Invalid OTP. Please try again.",
      });
    },
  });

  // --------------------------------
  // Resend OTP
  // --------------------------------

  const { mutate: resendOtpMutation, isPending: isResendingOtp } = useMutation({
    mutationFn: sendOtp,

    onSuccess: (response) => {
      showToast({
        type: "success",
        title: "Success",
        message: response?.message ?? "OTP resent successfully",
      });
      otpInputRef.current?.clear();
      setOtp("");
      setError("");
      setTimer(OTP_DURATION);
    },

    onError: (error) => {
      showToast({
        type: "error",
        title: "Error",
        message:
          error?.data?.message ?? "Failed to resend OTP. Please try again.",
      });
    },
  });

  // --------------------------------
  // OTP Countdown
  // --------------------------------

  useEffect(() => {
    if (timer <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // --------------------------------
  // Auto Verify OTP
  // --------------------------------

  // useEffect(() => {
  //   if (otp.length === 6 && !isVerifyingOtp && !isResendingOtp) {
  //     verifyOtpMutation({
  //       phone,
  //       otp,
  //     });
  //   }
  // }, [otp, phone, isVerifyingOtp, isResendingOtp, verifyOtpMutation]);

  // --------------------------------
  // OTP Change
  // --------------------------------

  const handleOnChange = (text: string) => {
    setOtp(text);

    if (error) {
      setError("");
    }
  };

  // --------------------------------
  // Resend OTP
  // --------------------------------

  const handleResendOtp = () => {
    if (timer > 0 || isResendingOtp || isVerifyingOtp) {
      return;
    }

    setError("");
    resendOtpMutation({
      phone,
    });
  };

  const formattedTimer = `00:${String(timer).padStart(2, "0")}`;

  const isLoading = isVerifyingOtp || isResendingOtp;

  return (
    <SafeAreaView style={styles.container}>
      <AppTopBar showBack />

      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <AppText variant="title" style={styles.title}>
            Verify OTP
          </AppText>

          <AppText style={styles.subTitle}>
            We've sent a 6-digit verification code to{"\n"}
            <AppText variant="smallBold" style={{ color: colors.primary }}>
              +91 {phone}
            </AppText>
          </AppText>
        </View>

        <View style={styles.otpSection}>
          <OtpInput
            ref={otpInputRef}
            numberOfDigits={6}
            focusColor={colors.primary}
            autoFocus
            hideStick
            placeholder="******"
            blurOnFilled
            disabled={isLoading}
            type="numeric"
            secureTextEntry={false}
            focusStickBlinkingDuration={500}
            onTextChange={handleOnChange}
            onFilled={(text) => {
              if (!isVerifyingOtp && !isResendingOtp) {
                verifyOtpMutation({
                  phone,
                  otp: text,
                });
              }
            }}
            textInputProps={{
              accessibilityLabel: "One-Time Password",
              caretHidden: true,
            }}
            textProps={{
              accessibilityRole: "text",
              accessibilityLabel: "OTP digit",
              allowFontScaling: false,
            }}
            theme={{
              containerStyle: styles.otpContainer,
              pinCodeContainerStyle: error
                ? styles.errorPinCodeContainer
                : styles.pinCodeContainer,
              pinCodeTextStyle: styles.pinCodeText,
              focusStickStyle: styles.focusStick,
              focusedPinCodeContainerStyle: error
                ? styles.errorPinCodeContainer
                : styles.activePinCodeContainer,
              placeholderTextStyle: styles.placeholderText,
              filledPinCodeContainerStyle: error
                ? styles.errorPinCodeContainer
                : styles.filledPinCodeContainer,
              disabledPinCodeContainerStyle: styles.disabledPinCodeContainer,
            }}
          />
        </View>

        <View style={styles.resendContainer}>
          <AppText style={styles.resendText}>Didn't receive the OTP?</AppText>

          {timer > 0 ? (
            <AppText style={styles.timer}>Resend in {formattedTimer}</AppText>
          ) : (
            <AppText
              variant="smallBold"
              style={styles.resendButton}
              disabled={isLoading}
              onPress={handleResendOtp}
            >
              {isResendingOtp ? "Sending..." : "Resend OTP"}
            </AppText>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VerifyOtpScreen;

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      gap: Spacing.xxxl,
      paddingTop: Spacing.section,
      paddingHorizontal: Spacing.lg,
    },

    headerContainer: {
      gap: Spacing.sm,
    },

    title: {
      color: colors.primary,
    },

    subTitle: {
      color: colors.text,
    },

    otpSection: {
      gap: Spacing.sm,
    },

    otpContainer: {
      width: "100%",
    },

    pinCodeContainer: {
      borderColor: colors.border,
    },

    errorPinCodeContainer: {
      borderColor: colors.error,
    },

    pinCodeText: {
      ...Typography.subtitle,
      color: colors.primary,
    },

    focusStick: {
      backgroundColor: colors.primary,
    },

    activePinCodeContainer: {
      borderColor: colors.primary,
    },

    placeholderText: {
      color: colors.textMuted,
    },

    filledPinCodeContainer: {
      borderColor: colors.primary,
    },

    disabledPinCodeContainer: {
      opacity: 0.5,
    },

    resendContainer: {
      alignItems: "center",
      gap: Spacing.xs,
    },

    resendText: {
      color: colors.text,
    },

    timer: {
      color: colors.textMuted,
    },

    resendButton: {
      color: colors.primary,
    },
  });
