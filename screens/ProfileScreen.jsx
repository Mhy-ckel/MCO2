import React, { useContext } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { UserContext } from "../activities/activity6/UserContext";
import { useAppTheme } from "../theme/useAppTheme";

export default function ProfileScreen({ navigation }) {
  const { displayName, darkMode } = useContext(UserContext);
  const { hubStyles, theme } = useAppTheme();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <ScrollView
      style={hubStyles.screen}
      contentContainerStyle={[
        hubStyles.scrollContent,
        { paddingBottom: tabBarHeight + 16 },
      ]}
    >
      <View style={hubStyles.page}>
        <View style={hubStyles.profileCard}>
          <View style={hubStyles.avatar}>
            <Text style={hubStyles.avatarText}>
              {displayName.trim().charAt(0).toUpperCase() || "S"}
            </Text>
          </View>

          <Text style={hubStyles.profileName}>{displayName}</Text>

          <Text style={hubStyles.profileSubtitle}>
            Student · React Native Activities
          </Text>
        </View>

        <View style={hubStyles.card}>
          <Text style={hubStyles.cardTitle}>Dashboard Settings</Text>

          <Text style={hubStyles.infoLabel}>Display name</Text>

          <Text style={hubStyles.infoValue}>{displayName}</Text>

          <Text style={hubStyles.infoLabel}>App appearance</Text>

          <Text style={hubStyles.infoValue}>
            {darkMode ? "Dark Mode" : "Light Mode"}
          </Text>

          <Text style={hubStyles.cardDescription}>
            Change these settings in Activity 6. Your display name will also
            update here.
          </Text>

          <Pressable
            onPress={() =>
              navigation.navigate("Activities", {
                screen: "Activity6",
                initial: false,
                params: {
                  screen: "Settings",
                },
              })
            }
            accessibilityRole="button"
            style={({ pressed }) => [
              hubStyles.cardButton,
              {
                backgroundColor: theme.button,
              },
              pressed && hubStyles.pressed,
            ]}
          >
            <Text style={hubStyles.buttonText}>Edit Dashboard Settings</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
