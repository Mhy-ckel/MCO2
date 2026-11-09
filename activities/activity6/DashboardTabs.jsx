import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import FeedScreen from "./FeedScreen";
import SettingsScreen from "./SettingsScreen";
import { useAppTheme } from "../../theme/useAppTheme";

const Tab = createBottomTabNavigator();

export default function DashboardTabs() {
  const { theme } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowIcon: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.secondary,

        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },

        sceneStyle: {
          backgroundColor: theme.background,
        },

        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />

      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
