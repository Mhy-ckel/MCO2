import React from "react";
import { Pressable, Text } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Main screens
import HomeScreen from "./screens/HomeScreen";
import ActivitiesScreen from "./screens/ActivitiesScreen";
import ProfileScreen from "./screens/ProfileScreen";

// Floating navigation component
import FloatingTabBar from "./components/FloatingTabBar";

// Activity screens
import UsersScreen from "./activities/activity5/UsersScreen";
import DashboardTabs from "./activities/activity6/DashboardTabs";
import NotesScreen from "./activities/activity7/NotesScreen";

// Shared state for Activity 6 and Profile
import { UserProvider } from "./activities/activity6/UserContext";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack inside the Activities tab
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
        options={{
          title: "My Activities",
        }}
      />

      <Stack.Screen
        name="Activity5"
        component={UsersScreen}
        options={{
          title: "Activity 5: API Data",
        }}
      />

      <Stack.Screen
        name="Activity6"
        component={DashboardTabs}
        options={{
          title: "Activity 6: Dashboard",
        }}
      />

      <Stack.Screen
        name="Activity7"
        component={NotesScreen}
        options={{
          title: "Activity 7: Notes",
        }}
      />
    </Stack.Navigator>
  );
}

// Main Home / Activities / Profile tabs
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerTitleAlign: "left",
        headerTintColor: "#0F172A",
        headerStyle: {
          backgroundColor: "#FFFFFF",
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

// App entry component
export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <NavigationContainer>
          <MainTabs />
        </NavigationContainer>
      </UserProvider>
    </SafeAreaProvider>
  );
}
