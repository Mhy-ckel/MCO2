import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAppTheme } from "../theme/useAppTheme";

const DARK_BADGES = {
  5: {
    background: "#243F62",
    text: "#BFDBFE",
  },
  6: {
    background: "#40335F",
    text: "#DDD6FE",
  },
  7: {
    background: "#21483D",
    text: "#A7F3D0",
  },
};

export default function ActivityCard({
  activity,
  onOpen,
  completed = false,
  onToggleComplete,
}) {
  const { hubStyles, darkMode, theme } = useAppTheme();

  const badge = darkMode
    ? DARK_BADGES[activity.number] || {
        background: "#334155",
        text: "#E2E8F0",
      }
    : {
        background: activity.background,
        text: activity.color,
      };

  return (
    <View style={hubStyles.card}>
      <View style={dashboardCardStyles.cardHeader}>
        <View
          style={[
            hubStyles.badge,
            {
              backgroundColor: badge.background,
            },
          ]}
        >
          <Text style={[hubStyles.badgeText, { color: badge.text }]}>
            ACTIVITY {activity.number}
          </Text>
        </View>

        {onToggleComplete ? (
          <Pressable
            onPress={onToggleComplete}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: completed }}
            accessibilityLabel={
              completed
                ? `Mark Activity ${activity.number} as not complete`
                : `Mark Activity ${activity.number} as complete`
            }
            hitSlop={10}
            style={({ pressed }) => [
              dashboardCardStyles.completeButton,
              {
                borderColor: theme.border,
                backgroundColor: completed ? "#047857" : "transparent",
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons
              name={completed ? "checkmark" : "ellipse-outline"}
              size={18}
              color={completed ? "#FFFFFF" : theme.text}
            />
          </Pressable>
        ) : null}
      </View>

      <Text style={hubStyles.cardTitle}>{activity.title}</Text>

      <Text style={hubStyles.cardDescription}>{activity.description}</Text>

      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`Open Activity ${activity.number}`}
        style={({ pressed }) => [
          hubStyles.cardButton,
          {
            backgroundColor: activity.color,
          },
          pressed && hubStyles.pressed,
        ]}
      >
        <Text style={hubStyles.buttonText}>Open Activity</Text>
      </Pressable>
    </View>
  );
}

const dashboardCardStyles = StyleSheet.create({
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  completeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
