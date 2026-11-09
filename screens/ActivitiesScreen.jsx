import React from "react";
import { ScrollView, Text, View } from "react-native";

import ActivityCard from "../components/ActivityCard";
import { activities } from "../data/activities";
import { hubStyles } from "../hubStyles";

export default function ActivitiesScreen({ navigation }) {
  return (
    <ScrollView
      style={hubStyles.screen}
      contentContainerStyle={hubStyles.scrollContent}
    >
      <View style={hubStyles.page}>
        <Text style={hubStyles.sectionTitle}>All Activities</Text>

        <Text style={hubStyles.sectionDescription}>
          Open an exercise to practice its React Native concepts.
        </Text>

        {activities.map((activity) => (
          <ActivityCard
            key={activity.number}
            activity={activity}
            onOpen={() => navigation.navigate(activity.route)}
          />
        ))}
      </View>
    </ScrollView>
  );
}
