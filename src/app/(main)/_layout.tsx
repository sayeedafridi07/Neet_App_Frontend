import { useTheme } from "@/theme/use-theme";
import { Stack } from "expo-router";

const AuthLayout = () => {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    />
  );
};

export default AuthLayout;
