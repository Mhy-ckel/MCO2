import React from "react";
import { Pressable, Text } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import HomeScreen from "./screens/HomeScreen";
import ActivitiesScreen from "./screens/ActivitiesScreen";
import ProfileScreen from "./screens/ProfileScreen";

import UsersScreen from "./activities/activity5/UsersScreen";
import DashboardTabs from "./activities/activity6/DashboardTabs";
import NotesScreen from "./activities/activity7/NotesScreen";
import { UserProvider } from "./activities/activity6/UserContext";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ActivitiesNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: "center",
        headerTintColor: "#0F172A",
        headerStyle: {
          backgroundColor: "#FFFFFF",
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

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerTitleAlign: "left",
              headerTintColor: "#0F172A",
              headerStyle: {
                backgroundColor: "#FFFFFF",
              },
              tabBarActiveTintColor: "#2563EB",
              tabBarInactiveTintColor: "#64748B",
              tabBarStyle: {
                backgroundColor: "#FFFFFF",
                borderTopColor: "#E2E8F0",
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: "600",
              },
            }}
          >
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={({ navigation }) => ({
                title: "My Activities",
                tabBarLabel: "Home",
                tabBarIcon: ({ color }) => (
                  <Text style={{ color, fontSize: 24 }}>⌂</Text>
                ),
                headerRight: () => (
                  <Pressable
                    onPress={() =>
                      navigation.navigate("Activities", {
                        screen: "ActivitiesList",
                      })
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Open activities menu"
                    style={{ padding: 12, marginRight: 4 }}
                  >
                    <Text
                      style={{
                        fontSize: 24,
                        color: "#0F172A",
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
                tabBarIcon: ({ color }) => (
                  <Text style={{ color, fontSize: 22 }}>▦</Text>
                ),
              }}
            />

            <Tab.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                title: "Student Profile",
                tabBarLabel: "Profile",
                tabBarIcon: ({ color }) => (
                  <Text style={{ color, fontSize: 22 }}>●</Text>
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </UserProvider>
    </SafeAreaProvider>
  );
}
