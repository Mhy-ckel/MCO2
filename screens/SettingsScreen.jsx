import React, { useContext, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { UserContext } from "../activities/activity6/UserContext";
import { ACCENT_COLORS, usePreferences } from "../context/PreferencesContext";
import { useFocusTimer } from "../context/FocusTimerContext";
import { useAppTheme } from "../theme/useAppTheme";

export default function SettingsScreen() {
  const {
    displayName,
    updateSettings,
    profileError,
    profileMessage,
    clearProfileFeedback,
  } = useContext(UserContext);

  const {
    preferences,
    preferencesError,
    updatePreferences,
    resetPreferences,
    clearPreferencesError,
  } = usePreferences();

  const {
    settings,
    updateSettings: updateTimerSettings,
    todayFocusMinutes,
    completedFocusSessions,
  } = useFocusTimer();

  const { theme, darkMode } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState(displayName || "");

  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [focusInput, setFocusInput] = useState(String(settings.focusMinutes));
  const [shortBreakInput, setShortBreakInput] = useState(
    String(settings.shortBreakMinutes),
  );
  const [longBreakInput, setLongBreakInput] = useState(
    String(settings.longBreakMinutes),
  );
  const [goalInput, setGoalInput] = useState(String(settings.dailyGoalMinutes));

  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importText, setImportText] = useState("");

  const styles = createStyles(theme, insets);

  function handleAppearanceChange(mode) {
    updateSettings({ appearanceMode: mode });
  }

  function handleSaveName() {
    updateSettings({ displayName: nameInput });
    setNameModalVisible(false);
  }

  function handleSaveTimerSettings() {
    const focus = Number.parseInt(focusInput, 10);
    const shortBreak = Number.parseInt(shortBreakInput, 10);
    const longBreak = Number.parseInt(longBreakInput, 10);
    const goal = Number.parseInt(goalInput, 10);

    if (
      Number.isNaN(focus) ||
      Number.isNaN(shortBreak) ||
      Number.isNaN(longBreak) ||
      Number.isNaN(goal)
    ) {
      return;
    }

    updateTimerSettings({
      focusMinutes: focus,
      shortBreakMinutes: shortBreak,
      longBreakMinutes: longBreak,
      dailyGoalMinutes: goal,
    });

    setTimerModalVisible(false);
  }

  async function handleExportData() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pairs = await AsyncStorage.multiGet(keys);

      const exportData = Object.fromEntries(pairs);

      await Share.share({
        message: JSON.stringify(exportData, null, 2),
      });
    } catch (error) {
      console.warn("Data export failed:", error);
    }
  }

  async function handleImportData() {
    try {
      const parsedData = JSON.parse(importText);

      if (!parsedData || typeof parsedData !== "object") {
        throw new Error("Invalid backup format.");
      }

      const entries = Object.entries(parsedData).filter(
        ([key, value]) => typeof key === "string" && typeof value === "string",
      );

      if (entries.length === 0) {
        throw new Error("No valid backup entries found.");
      }

      Alert.alert(
        "Restore backup",
        `Restore ${entries.length} saved item(s)? This may overwrite matching existing data.`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Restore",
            style: "destructive",
            onPress: async () => {
              try {
                await AsyncStorage.multiSet(entries);
                setImportModalVisible(false);
                setImportText("");
              } catch (error) {
                console.warn("Data import failed:", error);
              }
            },
          },
        ],
      );
    } catch (error) {
      console.warn("Backup parsing failed:", error);
    }
  }

  function handleResetPreferences() {
    Alert.alert(
      "Reset preferences",
      "This will reset appearance, productivity, and notification preferences. Your activities, events, and focus history will not be deleted.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: resetPreferences,
        },
      ],
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      <Text style={styles.description}>
        Personalize ActivityHub and manage your preferences.
      </Text>

      {profileError ? (
        <Pressable
          onPress={clearProfileFeedback}
          accessibilityRole="alert"
          style={styles.errorBanner}
        >
          <Text style={styles.errorText}>{profileError}</Text>
        </Pressable>
      ) : null}

      {profileMessage ? (
        <Pressable
          onPress={clearProfileFeedback}
          accessibilityRole="text"
          style={styles.successBanner}
        >
          <Text style={styles.successText}>{profileMessage}</Text>
        </Pressable>
      ) : null}

      {preferencesError ? (
        <Pressable
          onPress={clearPreferencesError}
          accessibilityRole="alert"
          style={styles.errorBanner}
        >
          <Text style={styles.errorText}>{preferencesError}</Text>
        </Pressable>
      ) : null}

      <Text style={styles.sectionTitle}>Appearance</Text>

      <View style={styles.card}>
        <Text style={styles.itemTitle}>Theme</Text>

        <View style={styles.optionRow}>
          {[
            {
              key: "light",
              label: "Light",
            },
            {
              key: "dark",
              label: "Dark",
            },
            {
              key: "system",
              label: "System",
            },
          ].map((option) => {
            const isActive = darkMode
              ? option.key === "dark"
              : option.key === "light";

            return (
              <Pressable
                key={option.key}
                onPress={() => handleAppearanceChange(option.key)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`${option.label} mode`}
                style={[
                  styles.optionButton,
                  isActive && styles.activeOptionButton,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    isActive && styles.activeOptionText,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.itemDescription}>
          System mode follows your device appearance setting.
        </Text>

        <Text style={styles.itemTitle}>Accent color</Text>

        <View style={styles.colorRow}>
          {ACCENT_COLORS.map((color) => {
            const isActive = preferences.accentColor === color.value;

            return (
              <Pressable
                key={color.key}
                onPress={() => updatePreferences({ accentColor: color.value })}
                accessibilityRole="radio"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`${color.label} accent color`}
                style={[
                  styles.colorSwatch,
                  {
                    backgroundColor: color.value,
                  },
                  isActive && styles.activeColorSwatch,
                ]}
              >
                {isActive ? (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.itemTitle}>Text size</Text>

        <View style={styles.optionRow}>
          {[
            {
              key: 0.9,
              label: "Small",
            },
            {
              key: 1,
              label: "Default",
            },
            {
              key: 1.15,
              label: "Large",
            },
          ].map((option) => {
            const isActive = preferences.fontScale === option.key;

            return (
              <Pressable
                key={option.key}
                onPress={() => updatePreferences({ fontScale: option.key })}
                accessibilityRole="radio"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`${option.label} text size`}
                style={[
                  styles.optionButton,
                  isActive && styles.activeOptionButton,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    isActive && styles.activeOptionText,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.itemDescription}>
          Text size currently applies to Settings. Full app-wide text scaling
          requires updating the shared style system.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Account & Profile</Text>

      <View style={styles.card}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(displayName || "S").trim().charAt(0).toUpperCase() || "S"}
            </Text>
          </View>

          <View style={styles.profileDetails}>
            <Text style={styles.profileValue}>{displayName || "Student"}</Text>

            <Text style={styles.profileLabel}>Display name</Text>
          </View>
        </View>

        <Pressable
          onPress={() => {
            setNameInput(displayName || "");
            setNameModalVisible(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Edit display name"
          style={({ pressed }) => [
            styles.settingsButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Ionicons name="person" size={18} color={theme.accent} />

          <Text style={styles.settingsButtonText}>Edit Display Name</Text>
        </Pressable>

        <Text style={styles.itemDescription}>
          Profile pictures are not supported by the current app setup.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Notifications</Text>

      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View style={styles.switchTextContainer}>
            <Text style={styles.itemTitle}>Enable notifications</Text>

            <Text style={styles.itemDescription}>
              Master switch for notification preferences.
            </Text>
          </View>

          <Switch
            value={preferences.notifications.enabled}
            onValueChange={(value) =>
              updatePreferences({
                notifications: {
                  enabled: value,
                },
              })
            }
            trackColor={{
              false: theme.border,
              true: theme.accent,
            }}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchTextContainer}>
            <Text style={styles.itemTitle}>Task reminders</Text>

            <Text style={styles.itemDescription}>
              Reminders for task deadlines.
            </Text>
          </View>

          <Switch
            value={preferences.notifications.taskReminders}
            onValueChange={(value) =>
              updatePreferences({
                notifications: {
                  taskReminders: value,
                },
              })
            }
            trackColor={{
              false: theme.border,
              true: theme.accent,
            }}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchTextContainer}>
            <Text style={styles.itemTitle}>Calendar reminders</Text>

            <Text style={styles.itemDescription}>
              Reminders for calendar events.
            </Text>
          </View>

          <Switch
            value={preferences.notifications.calendarReminders}
            onValueChange={(value) =>
              updatePreferences({
                notifications: {
                  calendarReminders: value,
                },
              })
            }
            trackColor={{
              false: theme.border,
              true: theme.accent,
            }}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchTextContainer}>
            <Text style={styles.itemTitle}>Focus timer alerts</Text>

            <Text style={styles.itemDescription}>
              Alerts when focus sessions end.
            </Text>
          </View>

          <Switch
            value={preferences.notifications.focusAlerts}
            onValueChange={(value) =>
              updatePreferences({
                notifications: {
                  focusAlerts: value,
                },
              })
            }
            trackColor={{
              false: theme.border,
              true: theme.accent,
            }}
          />
        </View>

        <Text style={styles.itemDescription}>
          These preferences are saved locally. Actual device notifications
          require the Expo notifications package and permission approval.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Productivity</Text>

      <View style={styles.card}>
        <View style={styles.statRow}>
          <View>
            <Text style={styles.statValue}>{todayFocusMinutes} min</Text>

            <Text style={styles.statLabel}>Today’s focus time</Text>
          </View>

          <View>
            <Text style={styles.statValue}>{completedFocusSessions}</Text>

            <Text style={styles.statLabel}>Completed sessions</Text>
          </View>
        </View>

        <Pressable
          onPress={() => {
            setFocusInput(String(settings.focusMinutes));
            setShortBreakInput(String(settings.shortBreakMinutes));
            setLongBreakInput(String(settings.longBreakMinutes));
            setGoalInput(String(settings.dailyGoalMinutes));
            setTimerModalVisible(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Edit Pomodoro settings"
          style={({ pressed }) => [
            styles.settingsButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Ionicons name="timer" size={18} color={theme.accent} />

          <Text style={styles.settingsButtonText}>Edit Pomodoro Settings</Text>
        </Pressable>

        <Text style={styles.itemTitle}>First day of week</Text>

        <View style={styles.optionRow}>
          {["Sunday", "Monday"].map((day) => {
            const isActive = preferences.firstDayOfWeek === day;

            return (
              <Pressable
                key={day}
                onPress={() => updatePreferences({ firstDayOfWeek: day })}
                accessibilityRole="radio"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`First day of week: ${day}`}
                style={[
                  styles.optionButton,
                  isActive && styles.activeOptionButton,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    isActive && styles.activeOptionText,
                  ]}
                >
                  {day}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.itemTitle}>Default calendar view</Text>

        <View style={styles.optionRow}>
          {[
            {
              key: "month",
              label: "Monthly",
            },
            {
              key: "week",
              label: "Weekly",
            },
            {
              key: "day",
              label: "Daily",
            },
          ].map((view) => {
            const isActive = preferences.defaultCalendarView === view.key;

            return (
              <Pressable
                key={view.key}
                onPress={() =>
                  updatePreferences({
                    defaultCalendarView: view.key,
                  })
                }
                accessibilityRole="radio"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`Default calendar view: ${view.label}`}
                style={[
                  styles.optionButton,
                  isActive && styles.activeOptionButton,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    isActive && styles.activeOptionText,
                  ]}
                >
                  {view.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.itemDescription}>
          Calendar view preference is saved for future calendar integration.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Data & Storage</Text>

      <View style={styles.card}>
        <Pressable
          onPress={handleExportData}
          accessibilityRole="button"
          accessibilityLabel="Export app data"
          style={({ pressed }) => [
            styles.settingsButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Ionicons name="download" size={18} color={theme.accent} />

          <Text style={styles.settingsButtonText}>Export App Data</Text>
        </Pressable>

        <Pressable
          onPress={() => setImportModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Import backup"
          style={({ pressed }) => [
            styles.settingsButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Ionicons name="cloud-upload" size={18} color={theme.accent} />

          <Text style={styles.settingsButtonText}>Import Backup</Text>
        </Pressable>

        <Pressable
          onPress={handleResetPreferences}
          accessibilityRole="button"
          accessibilityLabel="Reset preferences"
          style={({ pressed }) => [
            styles.destructiveButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Ionicons name="trash" size={18} color={theme.error} />

          <Text style={styles.destructiveButtonText}>Reset Preferences</Text>
        </Pressable>

        <Text style={styles.itemDescription}>
          ActivityHub stores data locally on your device. No cloud
          synchronization or external database is used.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Privacy & Security</Text>

      <View style={styles.card}>
        <Text style={styles.itemTitle}>Local data</Text>

        <Text style={styles.itemDescription}>
          Your display name, theme, calendar events, activity progress, and
          focus sessions are stored locally using AsyncStorage.
        </Text>

        <Text style={styles.itemTitle}>Security</Text>

        <Text style={styles.itemDescription}>
          App lock and biometric authentication are not enabled because the
          required native authentication setup is not installed.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>About ActivityHub</Text>

      <View style={styles.card}>
        <Text style={styles.itemTitle}>ActivityHub</Text>

        <Text style={styles.itemDescription}>
          Version 1.0.0 · A local-first productivity app for students,
          activities, schedules, and focused study sessions.
        </Text>

        <Text style={styles.itemTitle}>Developer</Text>

        <Text style={styles.itemDescription}>
          Built with React Native, Expo, React Navigation, and AsyncStorage.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Help & Support</Text>

      <View style={styles.card}>
        <Text style={styles.itemTitle}>Getting started</Text>

        <Text style={styles.itemDescription}>
          Open activities from Home, use Planner for Calendar and Focus Timer,
          and manage your profile from the Profile tab.
        </Text>

        <Text style={styles.itemTitle}>Feedback</Text>

        <Text style={styles.itemDescription}>
          Feedback and problem reports are not connected to an external service
          in this version.
        </Text>
      </View>

      <Modal
        visible={nameModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setNameModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Display Name</Text>

            <Pressable
              onPress={() => setNameModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Close display name editor"
              style={styles.closeButton}
            >
              <Ionicons name="close" size={20} color={theme.text} />
            </Pressable>
          </View>

          <TextInput
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="Enter display name"
            placeholderTextColor={theme.text}
            accessibilityLabel="Display name"
            style={styles.input}
          />

          <Pressable
            onPress={handleSaveName}
            accessibilityRole="button"
            accessibilityLabel="Save display name"
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Text style={styles.saveButtonText}>Save Name</Text>
          </Pressable>
        </View>
      </Modal>

      <Modal
        visible={timerModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setTimerModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pomodoro Settings</Text>

            <Pressable
              onPress={() => setTimerModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Close Pomodoro settings"
              style={styles.closeButton}
            >
              <Ionicons name="close" size={20} color={theme.text} />
            </Pressable>
          </View>

          <Text style={styles.fieldLabel}>Focus duration</Text>

          <TextInput
            value={focusInput}
            onChangeText={setFocusInput}
            keyboardType="number-pad"
            accessibilityLabel="Focus duration in minutes"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Short break duration</Text>

          <TextInput
            value={shortBreakInput}
            onChangeText={setShortBreakInput}
            keyboardType="number-pad"
            accessibilityLabel="Short break duration in minutes"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Long break duration</Text>

          <TextInput
            value={longBreakInput}
            onChangeText={setLongBreakInput}
            keyboardType="number-pad"
            accessibilityLabel="Long break duration in minutes"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Daily focus goal</Text>

          <TextInput
            value={goalInput}
            onChangeText={setGoalInput}
            keyboardType="number-pad"
            accessibilityLabel="Daily focus goal in minutes"
            style={styles.input}
          />

          <Pressable
            onPress={handleSaveTimerSettings}
            accessibilityRole="button"
            accessibilityLabel="Save Pomodoro settings"
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </Pressable>
        </View>
      </Modal>

      <Modal
        visible={importModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setImportModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Import Backup</Text>

            <Pressable
              onPress={() => setImportModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Close backup importer"
              style={styles.closeButton}
            >
              <Ionicons name="close" size={20} color={theme.text} />
            </Pressable>
          </View>

          <TextInput
            value={importText}
            onChangeText={setImportText}
            placeholder="Paste exported backup JSON here"
            placeholderTextColor={theme.text}
            accessibilityLabel="Backup JSON"
            multiline
            style={[styles.input, styles.multilineInput]}
          />

          <Pressable
            onPress={handleImportData}
            accessibilityRole="button"
            accessibilityLabel="Restore backup"
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Text style={styles.saveButtonText}>Restore Backup</Text>
          </Pressable>
        </View>
      </Modal>
    </ScrollView>
  );
}

const createStyles = (theme, insets) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      padding: 20,
      paddingTop: 20,
      paddingBottom: Math.max(insets.bottom, 24) + 24,
      gap: 18,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.text,
    },
    description: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.text,
      opacity: 0.7,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
      marginTop: 6,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      gap: 14,
    },
    itemTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.text,
    },
    itemDescription: {
      fontSize: 13,
      lineHeight: 18,
      color: theme.text,
      opacity: 0.7,
    },
    optionRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    optionButton: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.background,
    },
    activeOptionButton: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    optionText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.text,
    },
    activeOptionText: {
      color: "#FFFFFF",
    },
    colorRow: {
      flexDirection: "row",
      gap: 10,
    },
    colorSwatch: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
    },
    activeColorSwatch: {
      borderWidth: 3,
      borderColor: theme.text,
    },
    profileRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.accent,
    },
    avatarText: {
      fontSize: 20,
      fontWeight: "800",
      color: "#FFFFFF",
    },
    profileDetails: {
      gap: 3,
    },
    profileValue: {
      fontSize: 17,
      fontWeight: "700",
      color: theme.text,
    },
    profileLabel: {
      fontSize: 12,
      color: theme.text,
      opacity: 0.65,
    },
    settingsButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      padding: 14,
    },
    settingsButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
    },
    destructiveButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.error,
      borderRadius: 14,
      padding: 14,
    },
    destructiveButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.error,
    },
    pressedButton: {
      opacity: 0.75,
      transform: [{ scale: 0.98 }],
    },
    switchRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    switchTextContainer: {
      flex: 1,
      gap: 3,
    },
    statRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    statValue: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.text,
    },
    statLabel: {
      fontSize: 12,
      color: theme.text,
      opacity: 0.65,
    },
    errorBanner: {
      backgroundColor: theme.surface,
      borderColor: theme.error,
      borderWidth: 1,
      borderRadius: 14,
      padding: 12,
    },
    errorText: {
      color: theme.error,
      fontSize: 13,
      fontWeight: "500",
    },
    successBanner: {
      backgroundColor: theme.surface,
      borderColor: "#047857",
      borderWidth: 1,
      borderRadius: 14,
      padding: 12,
    },
    successText: {
      color: "#047857",
      fontSize: 13,
      fontWeight: "500",
    },
    modalContainer: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
      paddingTop: Math.max(insets.top, 24),
      gap: 14,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.text,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.text,
    },
    input: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      color: theme.text,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
    },
    multilineInput: {
      height: 160,
      textAlignVertical: "top",
    },
    saveButton: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.accent,
      borderRadius: 14,
      paddingVertical: 14,
    },
    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },
  });
