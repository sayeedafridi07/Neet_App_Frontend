import { toastConfig } from "@/components/ui/AppToast";
import { queryClient } from "@/config/queryClient";
import { useAppState } from "@/hooks/useAppState";
import { useOnlineManager } from "@/hooks/useOnlineManager";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/theme/use-theme";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const InitialLayout = () => {
  useAppState();
  useOnlineManager();
  const { colors } = useTheme();
  const { token, user } = useAuthStore((state) => state);

  const isAuthenticated = !!token && !!user?.profileComplete;
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(main)" />
        </Stack.Protected>

        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>

      <Toast config={toastConfig} />
    </>
  );
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <InitialLayout />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
