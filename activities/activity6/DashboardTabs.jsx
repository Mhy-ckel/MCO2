import React, { useContext, useLayoutEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { UserContext } from "./UserContext";
import FeedScreen from "./FeedScreen";
import SettingsScreen from "./SettingsScreen";
import { themes } from "../../styles";

const Tab = createBottomTabNavigator();

export default function DashboardTabs({ navigation }) {
  const { darkMode } = useContext(UserContext);
  const theme = darkMode ? themes.dark : themes.light;

  // Match the parent stack header to this activity's theme.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: theme.surface,
      },
      headerTintColor: theme.text,
    });
  }, [navigation, theme]);

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
