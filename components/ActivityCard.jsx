import React from "react";
import { Pressable, Text, View } from "react-native";

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

export default function ActivityCard({ activity, onOpen }) {
  const { hubStyles, darkMode } = useAppTheme();

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
