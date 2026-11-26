import { getSubjects } from "@/api/subjects.api";
import Header from "@/components/core/home/Header";
import SubjectCard from "@/components/core/home/SubjectCard";
import { AppText } from "@/components/ui/AppText";
import { toSubject } from "@/data/subjects";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Colors = ReturnType<typeof useTheme>["colors"];

const HomeScreen = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
  });
  const pullToRefresh = usePullToRefresh(refetch);
  const subjects = (response?.data?.subjects ?? []).map(toSubject);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl {...pullToRefresh} />}
      >
        <Header />

        <AppText variant="subtitle" style={styles.sectionTitle}>
          Your subjects
        </AppText>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={styles.empty} />
        ) : subjects.length === 0 ? (
          <Pressable onPress={() => refetch()} style={styles.empty}>
            <AppText variant="small" style={styles.emptyText}>
              {isError
                ? "Couldn't load subjects. Tap to retry."
                : "No subjects available yet."}
            </AppText>
          </Pressable>
        ) : (
          <View style={styles.list}>
            {subjects.map((s) => (
              <SubjectCard key={s.slug} subject={s} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.section * 2,
    },
    sectionTitle: {
      color: colors.text,
      marginBottom: Spacing.lg,
    },
    list: { gap: Spacing.lg },
    empty: { alignItems: "center", marginTop: Spacing.xl },
    emptyText: { color: colors.textSecondary },
  });

export default HomeScreen;
