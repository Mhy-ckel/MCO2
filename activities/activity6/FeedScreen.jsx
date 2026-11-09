import React, { useContext } from "react";

import { Pressable, ScrollView, Text, View } from "react-native";

import { UserContext } from "./UserContext";
import { useAppTheme } from "../../theme/useAppTheme";

export default function FeedScreen() {
  const { displayName, darkMode, saving, updateSettings } =
    useContext(UserContext);

  const { styles } = useAppTheme();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.page}>
        <Text style={styles.title}>Welcome, {displayName}!</Text>

        <Text style={styles.description}>
          Your profile is shared with the Settings tab.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Display name</Text>

          <Text style={styles.cardTitle}>{displayName}</Text>

          <Text style={[styles.label, styles.spacer]}>Appearance</Text>

          <Text style={styles.text}>
            {darkMode ? "Dark Mode" : "Light Mode"}
          </Text>
        </View>

        <Pressable
          onPress={() => updateSettings({ darkMode: !darkMode })}
          style={styles.button}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>
            Switch to {darkMode ? "Light" : "Dark"} Mode
          </Text>
        </Pressable>

        <Text style={styles.status} accessibilityLiveRegion="polite">
          {saving ? "Saving..." : "Edit your profile in Settings."}
        </Text>
      </View>
    </ScrollView>
  );
}
