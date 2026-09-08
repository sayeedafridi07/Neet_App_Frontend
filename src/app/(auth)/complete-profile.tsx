import { register } from "@/api/auth.api";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppText } from "@/components/ui/AppText";
import AppTopBar from "@/components/ui/AppTopBar";
import { registerSchema } from "@/schema/auth.schema";
import { useAuthStore } from "@/store/authStore";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import { showToast } from "@/utils/toast";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

const CompleteProfile = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { setUser } = useAuthStore((state) => state);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    schoolName: "",
    targetYear: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof formData, string | undefined>>
  >({});

  const handleOnChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const { mutate: registerMutation, isPending } = useMutation({
    mutationFn: register,

    onSuccess: (response) => {
      setUser(response.data);
    },

    onError: (error) => {
      console.log("REGISTER Error:", error);
      showToast({
        type: "error",
        title: "Error",
        message:
          error?.data?.message ??
          "Error occurred while registering. Please try again.",
      });
    },
  });

  const handleSubmit = () => {
    const payload = {
      ...formData,
      targetYear: formData.targetYear ? Number(formData.targetYear) : undefined,
    };
    const result = registerSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof typeof formData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof typeof formData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Hide keyboard
    Keyboard.dismiss();

    registerMutation(result.data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppTopBar showBack />
      <KeyboardAwareScrollView
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={20}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <AppText variant="title" style={styles.title}>
              Complete Your Profile
            </AppText>
            <AppText style={styles.title}>
              Let's personalize your learning experience.
            </AppText>
          </View>

          <AppInput
            label="Name"
            value={formData.name}
            onChangeText={(text) => handleOnChange("name", text)}
            placeholder="Name"
            error={errors?.name}
          />
          <AppInput
            label="School Name"
            value={formData.schoolName}
            onChangeText={(text) => handleOnChange("schoolName", text)}
            placeholder="School Name"
            error={errors?.schoolName}
          />
          <AppInput
            label="City"
            value={formData.city}
            onChangeText={(text) => handleOnChange("city", text)}
            placeholder="City"
            error={errors?.city}
          />
          <AppInput
            label="Target Year"
            value={formData.targetYear}
            onChangeText={(text) => handleOnChange("targetYear", text)}
            placeholder="Target Year"
            keyboardType="numeric"
            error={errors?.targetYear}
          />
        </View>
        <AppButton
          size="large"
          loading={isPending}
          disabled={isPending}
          onPress={handleSubmit}
        >
          Continue
        </AppButton>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    contentContainer: {
      flexGrow: 1,
      padding: Spacing.lg,
      gap: Spacing.xxl,
    },

    content: {
      flex: 1,
      gap: Spacing.xxl,
    },

    headerContainer: {
      gap: Spacing.sm,
    },

    title: {
      color: colors.text,
      textAlign: "center",
    },
  });

export default CompleteProfile;
