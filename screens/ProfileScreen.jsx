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
            styles.settingsCard,
            pressed && styles.pressedSettingsCard,
          ]}
        >
          <View style={styles.settingsIcon}>
            <Ionicons name="settings" size={20} color={theme.accent} />
          </View>

          <View style={styles.settingsContent}>
            <Text style={styles.settingsTitle}>Settings & Preferences</Text>

            <Text style={styles.settingsDescription}>
              Manage your app preferences
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color={theme.text} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    settingsCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 18,
      padding: 16,
      marginTop: 16,
    },
    pressedSettingsCard: {
      opacity: 0.8,
      transform: [{ scale: 0.99 }],
    },
    settingsIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
    },
    settingsContent: {
      flex: 1,
      gap: 3,
    },
    settingsTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.text,
    },
    settingsDescription: {
      fontSize: 13,
      color: theme.text,
      opacity: 0.7,
    },
  });
