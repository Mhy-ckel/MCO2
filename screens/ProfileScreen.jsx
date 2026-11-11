import React, { useContext } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { UserContext } from "../activities/activity6/UserContext";
import { useAppTheme } from "../theme/useAppTheme";

export default function ProfileScreen({ navigation }) {
  const { displayName, darkMode } = useContext(UserContext);
  const { hubStyles, theme } = useAppTheme();
  const tabBarHeight = useBottomTabBarHeight();

  const styles = createStyles(theme);

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

        <Pressable
          onPress={() => navigation.navigate("Settings")}
          accessibilityRole="button"
          accessibilityLabel="Open Settings and Preferences"
          style={({ pressed }) => [
            styles.settingsButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Ionicons name="settings" size={20} color={theme.accent} />

          <Text style={styles.settingsButtonText}>
            Open Settings & Preferences
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    settingsButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      paddingVertical: 16,
      marginTop: 16,
    },
    pressedButton: {
      opacity: 0.75,
      transform: [{ scale: 0.98 }],
    },
    settingsButtonText: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.text,
    },
  });
