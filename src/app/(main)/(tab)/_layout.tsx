import AppIcon from "@/components/ui/AppIcon";
import { useTheme } from "@/theme/use-theme";
import { Tabs } from "expo-router";

const TabLayout = () => {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          elevation: 0,
          // position: 'absolute',
          // bottom: 40,
          // height: 60,
          // marginHorizontal: 20,
          // borderRadius: 15,
          borderTopWidth: 0,
          // borderTopColor: colors.primary,
        },
        tabBarItemStyle: {
          paddingVertical: 10,
        },
        tabBarIconStyle: {
          // width: 24,
          // height: 24,
          // alignItems: 'center',
          // justifyContent: 'center',
        },
        headerShown: false,
        // tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <AppIcon name="House" color={color} />,
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: "Analysis",
          tabBarIcon: ({ color }) => <AppIcon name="Award" color={color} />,
        }}
      />
      <Tabs.Screen
        name="mcq"
        options={{
          title: "MCQ",
          tabBarIcon: ({ color }) => (
            <AppIcon name="ClipboardCheck" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <AppIcon name="User" color={color} />,
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
