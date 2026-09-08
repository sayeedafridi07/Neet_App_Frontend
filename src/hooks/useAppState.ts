import { focusManager } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppState, Platform } from "react-native";

export const useAppState = () => {
  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    const subscription = AppState.addEventListener("change", (status) => {
      focusManager.setFocused(status === "active");
    });

    return () => subscription.remove();
  }, []);
};
