import React from "react";
import { Pressable, Text, View } from "react-native";

import { hubStyles } from "../hubStyles";

export default function ActivityCard({ activity, onOpen }) {
  return (
    <View style={hubStyles.card}>
      <View style={[hubStyles.badge, { backgroundColor: activity.background }]}>
        <Text style={[hubStyles.badgeText, { color: activity.color }]}>
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
          { backgroundColor: activity.color },
          pressed && hubStyles.pressed,
        ]}
      >
        <Text style={hubStyles.buttonText}>Open Activity</Text>
      </Pressable>
    </View>
  );
}
