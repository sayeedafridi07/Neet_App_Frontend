import { AppText } from "@/components/ui/AppText";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const McqScreen = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppText variant="title" style={styles.title}>
          Coming Soon!
        </AppText>
      </View>
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
      color: colors.primary,
      textAlign: "center",
    },
  });

export default McqScreen;
