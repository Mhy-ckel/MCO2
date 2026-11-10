import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import ActivityCard from "../components/ActivityCard";
import { activities } from "../data/activities";

import { useActivityProgress } from "../context/ActivityProgressContext";
import { useAppTheme } from "../theme/useAppTheme";

export default function ActivitiesScreen({ navigation }) {
  const { hubStyles } = useAppTheme();
  const { recordActivityAccessed } = useActivityProgress();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <ScrollView
      style={hubStyles.screen}
      contentContainerStyle={[
        hubStyles.scrollContent,
        { paddingBottom: tabBarHeight + 16 },
      ]}
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
            onOpen={() => {
              recordActivityAccessed(activity.number);
              navigation.navigate(activity.route);
            }}
          />
        ))}
      </View>
    </ScrollView>
  );
}
