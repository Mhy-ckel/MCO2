import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "../theme/useAppTheme";

export default function PlannerScreen({ navigation }) {
  const { theme, hubStyles } = useAppTheme();
  const insets = useSafeAreaInsets();

  const styles = createStyles(theme, insets);

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
      <View style={hubStyles.hero}>
        <Text style={hubStyles.eyebrow}>PLANNER</Text>

        <Text style={hubStyles.welcome}>Plan your day</Text>

        <Text style={hubStyles.heroTitle}>Stay organized and focused</Text>

        <Text style={hubStyles.heroDescription}>
          Access your calendar, manage upcoming events, and start focused
          Pomodoro sessions.
        </Text>
      </View>

      <Pressable
        onPress={() => navigation.navigate("Calendar")}
        accessibilityRole="button"
        accessibilityLabel="Open Calendar"
        style={({ pressed }) => [
          styles.plannerCard,
          pressed && styles.pressedCard,
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="calendar" size={26} color={theme.accent} />
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Calendar</Text>

          <Text style={styles.cardDescription}>
            View and manage your schedule, events, and upcoming deadlines.
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color={theme.text} />
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate("FocusTimer")}
        accessibilityRole="button"
        accessibilityLabel="Open Focus Timer"
        style={({ pressed }) => [
          styles.plannerCard,
          pressed && styles.pressedCard,
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="timer" size={26} color="#047857" />
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Focus Timer</Text>

          <Text style={styles.cardDescription}>
            Start Pomodoro sessions, track focus time, and maintain momentum.
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color={theme.text} />
      </Pressable>
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
    plannerCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 20,
      padding: 18,
    },
    pressedCard: {
      opacity: 0.8,
      transform: [{ scale: 0.99 }],
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
    },
    cardContent: {
      flex: 1,
      gap: 4,
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: theme.text,
    },
    cardDescription: {
      fontSize: 13,
      lineHeight: 18,
      color: theme.text,
      opacity: 0.7,
    },
  });
