import React, { useEffect, useState } from "react";

import { ActivityIndicator, FlatList, Text, View } from "react-native";

import { useAppTheme } from "../../theme/useAppTheme";

const API_URL = "https://jsonplaceholder.typicode.com/users";

export default function UsersScreen() {
  const { styles, theme } = useAppTheme();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadUsers() {
      try {
        const response = await fetch(API_URL, {
          method: "GET",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("The API returned an unexpected response.");
        }

        if (active) {
          setUsers(data);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Could not load users.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.accent} />

        <Text style={styles.status}>Loading users...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.cardTitle}>Unable to load users</Text>

        <Text style={styles.error}>{error}</Text>

        <Text style={styles.muted}>
          Check your connection, then go back and reopen this activity.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={users}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        <View>
          <Text style={styles.title}>API Users</Text>

          <Text style={styles.description}>
            These records were loaded from JSONPlaceholder.
          </Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.muted}>No users found.</Text>}
      renderItem={({ item }) => (
        <View style={[styles.card, styles.page]}>
          <Text style={styles.cardTitle}>{item.name}</Text>

          <Text style={styles.text}>{item.email}</Text>

          <Text style={styles.muted}>@{item.username}</Text>
        </View>
      )}
    />
  );
}
