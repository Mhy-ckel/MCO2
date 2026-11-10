import React, { useContext } from "react";

import {
  ActivityIndicator,
  Pressable,
  StatusBar,
  Text,
  View,
} from "react-native";

import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import HomeScreen from "./screens/HomeScreen";
import ActivitiesScreen from "./screens/ActivitiesScreen";
import ProfileScreen from "./screens/ProfileScreen";
import FloatingTabBar from "./components/FloatingTabBar";

import UsersScreen from "./activities/activity5/UsersScreen";
import DashboardTabs from "./activities/activity6/DashboardTabs";
import NotesScreen from "./activities/activity7/NotesScreen";

import { UserContext, UserProvider } from "./activities/activity6/UserContext";
import { ActivityProgressProvider } from "./context/ActivityProgressContext";

import { useAppTheme } from "./theme/useAppTheme";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ActivitiesNavigator() {
  const { theme } = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: "center",
        headerTintColor: theme.text,
        headerStyle: {
          backgroundColor: theme.surface,
        },
        contentStyle: {
          backgroundColor: theme.background,
        },
      }}
    >
      <Stack.Screen
        name="ActivitiesList"
        component={ActivitiesScreen}
        options={{ title: "My Activities" }}
      />

      <Stack.Screen
        name="Activity5"
        component={UsersScreen}
        options={{ title: "Activity 5: API Data" }}
      />

      <Stack.Screen
        name="Activity6"
        component={DashboardTabs}
        options={{ title: "Activity 6: Dashboard" }}
      />

      <Stack.Screen
        name="Activity7"
        component={NotesScreen}
        options={{ title: "Activity 7: Notes" }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { theme } = useAppTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerTitleAlign: "left",
        headerTintColor: theme.text,
        headerStyle: {
          backgroundColor: theme.surface,
        },
        sceneStyle: {
          backgroundColor: theme.background,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: "My Activities",
          tabBarLabel: "Home",

          headerRight: () => (
            <Pressable
              onPress={() =>
                navigation.navigate("Activities", {
                  screen: "ActivitiesList",
                })
              }
              accessibilityRole="button"
              accessibilityLabel="Open activities menu"
              style={({ pressed }) => ({
                padding: 12,
                marginRight: 4,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text
                style={{
                  fontSize: 24,
                  color: theme.text,
                }}
              >
                ☰
              </Text>
            </Pressable>
          ),
        })}
      />

      <Tab.Screen
        name="Activities"
        component={ActivitiesNavigator}
        options={{
          headerShown: false,
          tabBarLabel: "Activities",
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Student Profile",
          tabBarLabel: "Profile",
        }}
      />
    </Tab.Navigator>
  );
}

function ThemedApplication() {
  const { themeReady, themeError } = useContext(UserContext);
  const { darkMode, theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const baseTheme = darkMode ? DarkTheme : DefaultTheme;

  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: theme.accent,
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
      notification: theme.error,
    },
  };

  if (!themeReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#222C3B",
        }}
      >
        <StatusBar barStyle="light-content" />

        <ActivityIndicator size="large" color="#BFDBFE" />

        <Text
          style={{
            color: "#F1F5F9",
            marginTop: 12,
          }}
        >
          Loading appearance...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
    >
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      <NavigationContainer theme={navigationTheme}>
        <MainTabs />
      </NavigationContainer>

      {themeError ? (
        <Text
          accessibilityRole="alert"
          style={{
            color: theme.error,
            backgroundColor: theme.surface,
            padding: 12,
            paddingBottom: Math.max(insets.bottom, 12),
          }}
        >
          {themeError}
        </Text>
      ) : null}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ActivityProgressProvider>
        <UserProvider>
          <ThemedApplication />
        </UserProvider>
      </ActivityProgressProvider>
    </SafeAreaProvider>
  );
}
