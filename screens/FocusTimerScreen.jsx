import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "../theme/useAppTheme";
import { useFocusTimer } from "../context/FocusTimerContext";

function formatTime(milliseconds) {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getSessionLabel(type) {
  if (type === "focus") {
    return "Focus Session";
  }

  if (type === "shortBreak") {
    return "Short Break";
  }

  return "Long Break";
}

export default function FocusTimerScreen() {
  const { theme, hubStyles } = useAppTheme();
  const insets = useSafeAreaInsets();

  const {
    settings,
    activeSession,
    history,
    timerError,
    remainingMilliseconds,
    sessionDurationMilliseconds,
    todayFocusMinutes,
    weeklyFocusMinutes,
    completedFocusSessions,
    completedPomodoroCycles,
    dailyGoalProgress,
    remainingGoalMinutes,
    startSession,
    pauseSession,
    resetSession,
    skipSession,
    selectSessionType,
    updateSettings,
    clearTimerError,
  } = useFocusTimer();

  const [focusInput, setFocusInput] = useState(String(settings.focusMinutes));
  const [shortBreakInput, setShortBreakInput] = useState(
    String(settings.shortBreakMinutes),
  );
  const [longBreakInput, setLongBreakInput] = useState(
    String(settings.longBreakMinutes),
  );
  const [cycleInput, setCycleInput] = useState(
    String(settings.sessionsBeforeLongBreak),
  );
  const [goalInput, setGoalInput] = useState(String(settings.dailyGoalMinutes));

  const progress =
    sessionDurationMilliseconds === 0
      ? 0
      : 1 - remainingMilliseconds / sessionDurationMilliseconds;

  const progressPercent = Math.round(progress * 100);

  const isRunning = activeSession.isRunning;
  const isPaused = !isRunning && activeSession.remainingWhenPaused > 0;

  const styles = createStyles(theme, insets);

  function handleSaveSettings() {
    const focus = Number.parseInt(focusInput, 10);
    const shortBreak = Number.parseInt(shortBreakInput, 10);
    const longBreak = Number.parseInt(longBreakInput, 10);
    const cycle = Number.parseInt(cycleInput, 10);
    const goal = Number.parseInt(goalInput, 10);

    if (
      Number.isNaN(focus) ||
      Number.isNaN(shortBreak) ||
      Number.isNaN(longBreak) ||
      Number.isNaN(cycle) ||
      Number.isNaN(goal)
    ) {
      return;
    }

    updateSettings({
      focusMinutes: focus,
      shortBreakMinutes: shortBreak,
      longBreakMinutes: longBreak,
      sessionsBeforeLongBreak: cycle,
      dailyGoalMinutes: goal,
    });
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom: Math.max(insets.bottom, 24) + 24,
        },
      ]}
    >
      <Text style={styles.title}>Focus Timer</Text>

      <Text style={styles.description}>
        Use focused Pomodoro sessions to build consistent study habits.
      </Text>

      {timerError ? (
        <Pressable
          onPress={clearTimerError}
          accessibilityRole="alert"
          style={styles.errorBanner}
        >
          <Text style={styles.errorText}>{timerError}</Text>
        </Pressable>
      ) : null}

      <View style={styles.timerCard}>
        <View style={styles.sessionTypeRow}>
          {[
            {
              key: "focus",
              label: "Focus",
            },
            {
              key: "shortBreak",
              label: "Short Break",
            },
            {
              key: "longBreak",
              label: "Long Break",
            },
          ].map((sessionType) => {
            const isActive = activeSession.type === sessionType.key;

            return (
              <Pressable
                key={sessionType.key}
                onPress={() => selectSessionType(sessionType.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`Select ${sessionType.label}`}
                style={[
                  styles.sessionTypeButton,
                  isActive && styles.activeSessionTypeButton,
                ]}
              >
                <Text
                  style={[
                    styles.sessionTypeText,
                    isActive && styles.activeSessionTypeText,
                  ]}
                >
                  {sessionType.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sessionLabel}>
          {getSessionLabel(activeSession.type)}
        </Text>

        <Text style={styles.sessionCount}>
          Focus session {activeSession.sessionNumber}
        </Text>

        <Text style={styles.timeText}>{formatTime(remainingMilliseconds)}</Text>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercent}%`,
              },
            ]}
          />
        </View>

        <Text style={styles.progressText}>{progressPercent}% complete</Text>

        <View style={styles.controls}>
          <Pressable
            onPress={isRunning ? pauseSession : startSession}
            accessibilityRole="button"
            accessibilityLabel={
              isRunning ? "Pause focus timer" : "Start focus timer"
            }
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Ionicons
              name={isRunning ? "pause" : "play"}
              size={20}
              color="#FFFFFF"
            />

            <Text style={styles.primaryButtonText}>
              {isRunning ? "Pause" : isPaused ? "Resume" : "Start"}
            </Text>
          </Pressable>

          <Pressable
            onPress={resetSession}
            accessibilityRole="button"
            accessibilityLabel="Reset focus timer"
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Ionicons name="refresh" size={20} color={theme.text} />

            <Text style={styles.secondaryButtonText}>Reset</Text>
          </Pressable>

          <Pressable
            onPress={skipSession}
            accessibilityRole="button"
            accessibilityLabel="Skip current session"
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Ionicons name="play-forward" size={20} color={theme.text} />

            <Text style={styles.secondaryButtonText}>Skip</Text>
          </Pressable>
        </View>

        <Text style={styles.cycleText}>
          {activeSession.completedFocusCount} focus sessions completed in this
          cycle
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Focus Statistics</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{todayFocusMinutes}</Text>
            <Text style={styles.statLabel}>Today’s focus minutes</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{weeklyFocusMinutes}</Text>
            <Text style={styles.statLabel}>This week’s focus minutes</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedFocusSessions}</Text>
            <Text style={styles.statLabel}>Completed focus sessions</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedPomodoroCycles}</Text>
            <Text style={styles.statLabel}>Completed Pomodoro cycles</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Focus Goal</Text>

        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>Today’s target</Text>

            <Text style={styles.goalValue}>
              {todayFocusMinutes} / {settings.dailyGoalMinutes} min
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.goalProgressFill,
                {
                  width: `${dailyGoalProgress}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.goalDescription}>
            {remainingGoalMinutes === 0
              ? "Daily focus goal reached. Excellent work!"
              : `${remainingGoalMinutes} minutes remaining today.`}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timer Settings</Text>

        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Focus duration</Text>

            <TextInput
              value={focusInput}
              onChangeText={setFocusInput}
              keyboardType="number-pad"
              accessibilityLabel="Focus duration in minutes"
              style={styles.settingInput}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Short break</Text>

            <TextInput
              value={shortBreakInput}
              onChangeText={setShortBreakInput}
              keyboardType="number-pad"
              accessibilityLabel="Short break duration in minutes"
              style={styles.settingInput}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Long break</Text>

            <TextInput
              value={longBreakInput}
              onChangeText={setLongBreakInput}
              keyboardType="number-pad"
              accessibilityLabel="Long break duration in minutes"
              style={styles.settingInput}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Sessions before long break</Text>

            <TextInput
              value={cycleInput}
              onChangeText={setCycleInput}
              keyboardType="number-pad"
              accessibilityLabel="Number of focus sessions before a long break"
              style={styles.settingInput}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Daily focus goal</Text>

            <TextInput
              value={goalInput}
              onChangeText={setGoalInput}
              keyboardType="number-pad"
              accessibilityLabel="Daily focus goal in minutes"
              style={styles.settingInput}
            />
          </View>

          <Pressable
            onPress={handleSaveSettings}
            accessibilityRole="button"
            accessibilityLabel="Save timer settings"
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>

        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="timer-outline" size={28} color={theme.text} />

            <Text style={styles.emptyTitle}>No completed sessions yet</Text>

            <Text style={styles.emptyDescription}>
              Start a focus session to begin tracking your productivity.
            </Text>
          </View>
        ) : (
          history.slice(0, 5).map((session) => (
            <View key={session.id} style={styles.historyItem}>
              <View>
                <Text style={styles.historyTitle}>
                  {getSessionLabel(session.type)}
                </Text>

                <Text style={styles.historyDate}>
                  {new Date(session.completedAt).toLocaleString()}
                </Text>
              </View>

              <Text style={styles.historyMinutes}>{session.minutes} min</Text>
            </View>
          ))
        )}
      </View>
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
    timerCard: {
      backgroundColor: theme.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 20,
      gap: 16,
    },
    sessionTypeRow: {
      flexDirection: "row",
      gap: 8,
    },
    sessionTypeButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.background,
    },
    activeSessionTypeButton: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    sessionTypeText: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.text,
    },
    activeSessionTypeText: {
      color: "#FFFFFF",
    },
    sessionLabel: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
      textAlign: "center",
    },
    sessionCount: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.text,
      opacity: 0.65,
      textAlign: "center",
    },
    timeText: {
      fontSize: 56,
      fontWeight: "800",
      color: theme.text,
      textAlign: "center",
      fontVariant: ["tabular-nums"],
    },
    progressTrack: {
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: theme.accent,
    },
    progressText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.text,
      opacity: 0.65,
      textAlign: "center",
    },
    controls: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    primaryButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: theme.accent,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 14,
    },
    secondaryButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    pressedButton: {
      opacity: 0.75,
      transform: [{ scale: 0.98 }],
    },
    primaryButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },
    secondaryButtonText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "600",
    },
    cycleText: {
      fontSize: 12,
      color: theme.text,
      opacity: 0.65,
      textAlign: "center",
    },
    section: {
      gap: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    statCard: {
      flexBasis: "48%",
      flexGrow: 1,
      backgroundColor: theme.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      gap: 6,
    },
    statValue: {
      fontSize: 26,
      fontWeight: "800",
      color: theme.text,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.text,
      opacity: 0.65,
    },
    goalCard: {
      backgroundColor: theme.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 18,
      gap: 12,
    },
    goalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    goalTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
    },
    goalValue: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.text,
      opacity: 0.7,
    },
    goalProgressFill: {
      height: "100%",
      backgroundColor: "#047857",
    },
    goalDescription: {
      fontSize: 13,
      color: theme.text,
      opacity: 0.7,
    },
    settingsCard: {
      backgroundColor: theme.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 18,
      gap: 14,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    settingLabel: {
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
    },
    settingInput: {
      width: 80,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.background,
      color: theme.text,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      textAlign: "center",
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
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 18,
      padding: 24,
      gap: 10,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
    },
    emptyDescription: {
      textAlign: "center",
      fontSize: 13,
      lineHeight: 19,
      color: theme.text,
      opacity: 0.7,
    },
    historyItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      padding: 14,
    },
    historyTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.text,
    },
    historyDate: {
      fontSize: 12,
      color: theme.text,
      opacity: 0.6,
      marginTop: 3,
    },
    historyMinutes: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.accent,
    },
  });
