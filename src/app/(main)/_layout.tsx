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
    >
      <Stack.Screen name="(tab)" />
      <Stack.Screen
        name="audio-player"
        options={{
          animation: "slide_from_bottom",
          gestureDirection: "vertical",
          fullScreenGestureEnabled: false,
        }}
      />
      {/* No swipe-back mid-exam; the screen asks before leaving. */}
      <Stack.Screen
        name="quiz/attempt/[id]"
        options={{ gestureEnabled: false }}
      />
    </Stack>
  );
};

export default AuthLayout;
