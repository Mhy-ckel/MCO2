import React, { useContext, useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { UserContext } from "./UserContext";
import { styles, themes } from "../../styles";

export default function SettingsScreen() {
  const { displayName, darkMode, saving, updateSettings } =
    useContext(UserContext);

  const [nameInput, setNameInput] = useState(displayName);
  const [error, setError] = useState("");

  const theme = darkMode ? themes.dark : themes.light;

  useEffect(() => {
    setNameInput(displayName);
  }, [displayName]);

  function saveName() {
    const name = nameInput.trim();

    if (!name) {
      setError("Please enter a display name.");
      return;
    }

    setError("");
    updateSettings({ displayName: name });
    Keyboard.dismiss();
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.page}>
          <Text style={[styles.title, { color: theme.text }]}>
            Profile Settings
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
            <Text style={[styles.label, { color: theme.text }]}>
              Display name
            </Text>

            <TextInput
              value={nameInput}
              onChangeText={(text) => {
                setNameInput(text);
                setError("");
              }}
              placeholder="Enter your name"
              placeholderTextColor={theme.secondary}
              maxLength={40}
              autoCapitalize="words"
              accessibilityLabel="Display name"
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            />

            {error ? (
              <Text
                style={[
                  styles.error,
                  { color: darkMode ? "#FCA5A5" : "#B91C1C" },
                ]}
              >
                {error}
              </Text>
            ) : null}

            <Pressable
              onPress={saveName}
              style={styles.button}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>Save Name</Text>
            </Pressable>
          </View>

          <View
            style={[
              styles.card,
              styles.row,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.flex}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Dark mode
              </Text>

              <Text style={[styles.muted, { color: theme.secondary }]}>
                {darkMode ? "Enabled" : "Disabled"}
              </Text>
            </View>

            <Switch
              value={darkMode}
              onValueChange={(value) => updateSettings({ darkMode: value })}
              accessibilityLabel="Dark mode"
              trackColor={{
                false: "#94A3B8",
                true: "#2563EB",
              }}
              thumbColor="#FFFFFF"
            />
          </View>

          <Text
            style={[styles.status, { color: theme.secondary }]}
            accessibilityLiveRegion="polite"
          >
            {saving ? "Saving..." : `Current name: ${displayName}`}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
