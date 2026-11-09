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
import { useAppTheme } from "../../theme/useAppTheme";

export default function SettingsScreen() {
  const { displayName, darkMode, saving, updateSettings } =
    useContext(UserContext);

  const { styles, theme } = useAppTheme();

  const [nameInput, setNameInput] = useState(displayName);
  const [error, setError] = useState("");

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
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.page}>
          <Text style={styles.title}>Profile Settings</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Display name</Text>

            <TextInput
              value={nameInput}
              onChangeText={(text) => {
                setNameInput(text);
                setError("");
              }}
              placeholder="Enter your name"
              placeholderTextColor={theme.placeholder}
              selectionColor={theme.accent}
              keyboardAppearance={darkMode ? "dark" : "light"}
              maxLength={40}
              autoCapitalize="words"
              accessibilityLabel="Display name"
              style={styles.input}
            />

            {error ? (
              <Text style={styles.error} accessibilityRole="alert">
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

          <View style={[styles.card, styles.row]}>
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>Dark mode</Text>

              <Text style={styles.muted}>
                {darkMode ? "Enabled" : "Disabled"}
              </Text>
            </View>

            <Switch
              value={darkMode}
              onValueChange={(value) => updateSettings({ darkMode: value })}
              accessibilityLabel="Dark mode"
              trackColor={{
                false: "#94A3B8",
                true: theme.button,
              }}
              thumbColor={theme.buttonText}
            />
          </View>

          <Text style={styles.status} accessibilityLiveRegion="polite">
            {saving ? "Saving..." : `Current name: ${displayName}`}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
