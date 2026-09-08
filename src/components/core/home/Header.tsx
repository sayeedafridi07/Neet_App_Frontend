import AppIcon from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import { Spacing } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

type Colors = ReturnType<typeof useTheme>["colors"];

const Header = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const profile = {
    firstName: "Sayeed",
    image: "https://avatars.githubusercontent.com/u/10502592?v=4",
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };
  return (
    <View style={styles.header}>
      <Animated.View
        entering={FadeInDown.duration(400).springify()}
        style={styles.profileContainer}
      >
        <Image
          source={{ uri: profile.image }}
          style={styles.profilePic}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
          placeholder="L6PZfSi_.AyE_3t7t7R**0o#DgR4"
          placeholderContentFit="cover"
        />
        <View>
          <AppText variant="smallBold" style={styles.greeting}>
            {greeting()}!
          </AppText>
          <AppText style={styles.name}>{profile.firstName}</AppText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(400).springify()}>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push("/notification")}
        >
          <AppIcon name="Bell" color={colors.AppText} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default Header;

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    profileContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
    },
    greeting: {
      color: colors.primary,
    },
    name: {
      color: colors.text,
      marginTop: Spacing.xs,
    },
    profilePic: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    notificationButton: {
      padding: Spacing.md,
      borderRadius: 99,
      backgroundColor: colors.surface,
    },
  });
