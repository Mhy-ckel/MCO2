import React, { useContext } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { UserContext } from "../activities/activity6/UserContext";
import { hubStyles } from "../hubStyles";

export default function ProfileScreen({ navigation }) {
  const { displayName, darkMode } = useContext(UserContext);

  return (
    <ScrollView
      style={hubStyles.screen}
      contentContainerStyle={hubStyles.scrollContent}
    >
      <View style={hubStyles.page}>
        <View style={hubStyles.profileCard}>
          <View style={hubStyles.avatar}>
            <Text style={hubStyles.avatarText}>
              {displayName.trim().charAt(0).toUpperCase() || "S"}
            </Text>
          </View>

          <Text style={hubStyles.profileName}>{displayName}</Text>

          <Text style={hubStyles.profileSubtitle}>
            Student · React Native Activities
          </Text>
        </View>

        <View style={hubStyles.card}>
          <Text style={hubStyles.cardTitle}>Dashboard Settings</Text>

          <Text style={hubStyles.infoLabel}>Display name</Text>

          <Text style={hubStyles.infoValue}>{displayName}</Text>

          <Text style={hubStyles.infoLabel}>Activity 6 appearance</Text>

          <Text style={hubStyles.infoValue}>
            {darkMode ? "Dark Mode" : "Light Mode"}
          </Text>

          <Text style={hubStyles.cardDescription}>
            Change these settings in Activity 6. Your display name will also
            update here.
          </Text>

          <Pressable
            onPress={() =>
              navigation.navigate("Activities", {
                screen: "Activity6",
                initial: false,
                params: {
                  screen: "Settings",
                },
              })
            }
            accessibilityRole="button"
            style={({ pressed }) => [
              hubStyles.cardButton,
              { backgroundColor: "#2563EB" },
              pressed && hubStyles.pressed,
            ]}
          >
            <Text style={hubStyles.buttonText}>Edit Dashboard Settings</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
