import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAppTheme } from "../theme/useAppTheme";

export default function CalendarEventCard({
  event,
  onPress,
  showDate = false,
}) {
  const { theme } = useAppTheme();

  const timeText = event.isAllDay
    ? "All day"
    : `${event.startTime || "00:00"}${
        event.endTime ? ` – ${event.endTime}` : ""
      }`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open event ${event.title}`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
        pressed && styles.pressedCard,
      ]}
    >
      <View
        style={[
          styles.categoryIndicator,
          {
            backgroundColor: event.color,
          },
        ]}
      />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {event.title}
          </Text>

          <View
            style={[
              styles.categoryBadge,
              {
                backgroundColor: event.color,
              },
            ]}
          >
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
        </View>

        {event.description ? (
          <Text
            style={[styles.description, { color: theme.text }]}
            numberOfLines={2}
          >
            {event.description}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color={theme.text} />

          <Text style={[styles.metaText, { color: theme.text }]}>
            {timeText}
          </Text>

          {showDate ? (
            <>
              <Ionicons name="calendar-outline" size={14} color={theme.text} />

              <Text style={[styles.metaText, { color: theme.text }]}>
                {event.date}
              </Text>
            </>
          ) : null}
        </View>

        {event.location ? (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={theme.text} />

            <Text style={[styles.metaText, { color: theme.text }]}>
              {event.location}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    overflow: "hidden",
  },
  pressedCard: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  categoryIndicator: {
    width: 5,
    borderRadius: 3,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
  },
  categoryBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.75,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    opacity: 0.7,
  },
});
