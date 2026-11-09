import React, { useContext } from "react";

import { Pressable, ScrollView, Text, View } from "react-native";

import ActivityCard from "../components/ActivityCard";
import { activities } from "../data/activities";

import { UserContext } from "../activities/activity6/UserContext";
import { useAppTheme } from "../theme/useAppTheme";

export default function HomeScreen({ navigation }) {
  const { displayName } = useContext(UserContext);
  const { hubStyles } = useAppTheme();

  function openActivity(route) {
    navigation.navigate("Activities", {
      screen: route,
      initial: false,
    });
  }

  return (
    <ScrollView
      style={hubStyles.screen}
      contentContainerStyle={hubStyles.scrollContent}
    >
      <View style={hubStyles.page}>
        <View style={hubStyles.hero}>
          <Text style={hubStyles.eyebrow}>ACTIVITY LIST.</Text>

          <Text style={hubStyles.welcome}>Hello, {displayName}!</Text>

          <Text style={hubStyles.heroTitle}>Welcome to Activities</Text>

          <Text style={hubStyles.heroDescription}>
            Practice API fetching, shared state, and local storage through three
            simple React Native activities.
          </Text>

          <Pressable
            onPress={() =>
              navigation.navigate("Activities", {
                screen: "ActivitiesList",
              })
            }
            accessibilityRole="button"
            style={({ pressed }) => [
              hubStyles.heroButton,
              pressed && hubStyles.pressed,
            ]}
          >
            <Text style={hubStyles.heroButtonText}>Get Started</Text>
          </Pressable>
        </View>

        <Text style={hubStyles.sectionTitle}>Explore your activities</Text>

        <Text style={hubStyles.sectionDescription}>
          Choose an activity below to begin.
        </Text>

        {activities.map((activity) => (
          <ActivityCard
            key={activity.number}
            activity={activity}
            onOpen={() => openActivity(activity.route)}
          />
        ))}
      </View>
    </ScrollView>
  );
}
