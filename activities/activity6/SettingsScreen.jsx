import React, { useContext, useEffect, useState } from "react";

import {
  ActivityIndicator,
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
  const {
    displayName,
    darkMode,
    saving,
    nameSaving,
    updateSettings,
    profileError,
    profileMessage,
    clearProfileFeedback,
  } = useContext(UserContext);

  const { styles, theme } = useAppTheme();

  const [nameInput, setNameInput] = useState(displayName);

  useEffect(() => {
    setNameInput(displayName);
  }, [displayName]);

  async function handleSaveName() {
    if (nameSaving) {
      return;
    }

    const saved = await updateSettings({
      displayName: nameInput,
    });

    if (saved) {
      Keyboard.dismiss();
    }
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
                clearProfileFeedback();
              }}
              placeholder="Enter your name"
              placeholderTextColor={theme.placeholder}
              selectionColor={theme.accent}
              keyboardAppearance={darkMode ? "dark" : "light"}
              editable={!nameSaving}
              maxLength={40}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
              accessibilityLabel="Display name"
              style={styles.input}
            />

            <Pressable
              onPress={handleSaveName}
              disabled={nameSaving}
              accessibilityRole="button"
              accessibilityState={{
                disabled: nameSaving,
              }}
              style={({ pressed }) => [
                styles.button,
                (pressed || nameSaving) && styles.disabled,
              ]}
            >
              <Text style={styles.buttonText}>
                {nameSaving ? "Saving..." : "Save Name"}
              </Text>
            </Pressable>

            {nameSaving && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                <ActivityIndicator size="small" color={theme.accent} />

                <Text
                  style={[styles.muted, { marginLeft: 8 }]}
                  accessibilityLiveRegion="polite"
                >
                  Saving your name...
                </Text>
              </View>
            )}

            {profileError ? (
              <Text style={styles.error} accessibilityRole="alert">
                {profileError}
              </Text>
            ) : null}

            {profileMessage ? (
              <Text
                style={[styles.status, { color: theme.accent }]}
                accessibilityLiveRegion="polite"
              >
                {profileMessage}
              </Text>
            ) : null}
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
              onValueChange={(value) => {
                updateSettings({ darkMode: value });
              }}
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
