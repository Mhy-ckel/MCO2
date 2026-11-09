import React, { useContext } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { UserContext } from "./UserContext";
import { styles, themes } from "../../styles";

export default function FeedScreen() {
  const { displayName, darkMode, saving, updateSettings } =
    useContext(UserContext);

  const theme = darkMode ? themes.dark : themes.light;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.page}>
        <Text style={[styles.title, { color: theme.text }]}>
          Welcome, {displayName}!
        </Text>

        <Text style={[styles.description, { color: theme.secondary }]}>
          Your profile is shared with the Settings tab.
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.label, { color: theme.secondary }]}>
            Display name
          </Text>

          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {displayName}
          </Text>

          <Text
            style={[styles.label, styles.spacer, { color: theme.secondary }]}
          >
            Appearance
          </Text>

          <Text style={[styles.text, { color: theme.text }]}>
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

        <Text
          style={[styles.status, { color: theme.secondary }]}
          accessibilityLiveRegion="polite"
        >
          {saving ? "Saving..." : "Edit your profile in Settings."}
        </Text>
      </View>
    </ScrollView>
  );
}
