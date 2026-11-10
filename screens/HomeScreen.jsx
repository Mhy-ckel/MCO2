import React, { useContext, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import ActivityCard from "../components/ActivityCard";
import { activities } from "../data/activities";

import { UserContext } from "../activities/activity6/UserContext";
import { useActivityProgress } from "../context/ActivityProgressContext";
import { useFocusTimer } from "../context/FocusTimerContext";
import { useAppTheme } from "../theme/useAppTheme";

function getGreeting() {
  const currentHour = new Date().getHours();

  if (currentHour < 12) {
    return "Good morning";
  }

  if (currentHour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function HomeScreen({ navigation }) {
  const { displayName } = useContext(UserContext);
  const {
    completedActivityIds,
    recentActivityIds,
    progressReady,
    progressError,
    toggleActivityCompletion,
    clearProgressError,
  } = useActivityProgress();

  const {
    todayFocusMinutes,
    completedFocusSessions,
    dailyGoalProgress,
    settings,
  } = useFocusTimer();

  const { hubStyles, theme } = useAppTheme();
  const tabBarHeight = useBottomTabBarHeight();

  const entranceOpacity = useRef(new Animated.Value(0)).current;
  const entranceTranslateY = useRef(new Animated.Value(16)).current;

  const progressAnimation = useRef(new Animated.Value(0)).current;

  const totalActivities = activities.length;
  const completedActivities = activities.filter((activity) =>
    completedActivityIds.includes(activity.number),
  ).length;
  const remainingActivities = totalActivities - completedActivities;

  const overallProgress =
    totalActivities === 0
      ? 0
      : Math.round((completedActivities / totalActivities) * 100);

  const recentActivities = useMemo(() => {
    return recentActivityIds
      .map((activityId) =>
        activities.find((activity) => activity.number === activityId),
      )
      .filter(Boolean);
  }, [recentActivityIds]);

  const continueLearningActivity = useMemo(() => {
    const recentUnfinishedActivity = recentActivities.find(
      (activity) => !completedActivityIds.includes(activity.number),
    );

    if (recentUnfinishedActivity) {
      return recentUnfinishedActivity;
    }

    return activities.find(
      (activity) => !completedActivityIds.includes(activity.number),
    );
  }, [recentActivities, completedActivityIds]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entranceOpacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.spring(entranceTranslateY, {
        toValue: 0,
        friction: 8,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();
  }, [entranceOpacity, entranceTranslateY]);

  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: overallProgress,
      duration: 650,
      useNativeDriver: false,
    }).start();
  }, [overallProgress, progressAnimation]);

  function openActivity(route) {
    navigation.navigate("Activities", {
      screen: route,
      initial: false,
    });
  }

  function handleRecentActivityOpen(activity) {
    navigation.navigate("Activities", {
      screen: activity.route,
      initial: false,
    });
  }

  function handleContinueLearning() {
    if (continueLearningActivity) {
      openActivity(continueLearningActivity.route);
      return;
    }

    navigation.navigate("Activities", {
      screen: "ActivitiesList",
    });
  }

  const dashboardStyles = createDashboardStyles(theme);

  return (
    <ScrollView
      style={hubStyles.screen}
      contentContainerStyle={[
        hubStyles.scrollContent,
        { paddingBottom: tabBarHeight + 16 },
      ]}
    >
      <Animated.View
        style={[
          dashboardStyles.dashboard,
          {
            opacity: entranceOpacity,
            transform: [{ translateY: entranceTranslateY }],
          },
        ]}
      >
        <View style={hubStyles.hero}>
          <Text style={hubStyles.eyebrow}>PERSONAL DASHBOARD</Text>

          <Text style={hubStyles.welcome}>
            {getGreeting()},{" "}
            {displayName && displayName.trim().length > 0
              ? displayName.trim()
              : "Student"}
            !
          </Text>

          <Text style={hubStyles.heroTitle}>Ready to make progress?</Text>

          <Text style={hubStyles.heroDescription}>
            {formatDate()} · Keep building your React Native skills one activity
            at a time.
          </Text>
        </View>

        {progressError ? (
          <Pressable
            onPress={clearProgressError}
            accessibilityRole="alert"
            style={dashboardStyles.errorBanner}
          >
            <Text style={dashboardStyles.errorText}>{progressError}</Text>
          </Pressable>
        ) : null}

        <View style={dashboardStyles.summaryRow}>
          <View style={dashboardStyles.summaryCard}>
            <View style={dashboardStyles.summaryIcon}>
              <Ionicons name="layers-outline" size={20} color={theme.accent} />
            </View>

            <Text style={dashboardStyles.summaryValue}>{totalActivities}</Text>

            <Text style={dashboardStyles.summaryLabel}>Total Activities</Text>
          </View>

          <View style={dashboardStyles.summaryCard}>
            <View style={dashboardStyles.summaryIcon}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#047857"
              />
            </View>

            <Text style={dashboardStyles.summaryValue}>
              {completedActivities}
            </Text>

            <Text style={dashboardStyles.summaryLabel}>Completed</Text>
          </View>
        </View>

        <View style={dashboardStyles.summaryRow}>
          <View style={dashboardStyles.summaryCard}>
            <View style={dashboardStyles.summaryIcon}>
              <Ionicons name="time-outline" size={20} color="#D97706" />
            </View>

            <Text style={dashboardStyles.summaryValue}>
              {remainingActivities}
            </Text>

            <Text style={dashboardStyles.summaryLabel}>Remaining</Text>
          </View>

          <View style={dashboardStyles.summaryCard}>
            <View style={dashboardStyles.summaryIcon}>
              <Ionicons name="stats-chart-outline" size={20} color="#7C3AED" />
            </View>

            <Text style={dashboardStyles.summaryValue}>{overallProgress}%</Text>

            <Text style={dashboardStyles.summaryLabel}>Progress</Text>
          </View>
        </View>

        <View style={dashboardStyles.progressCard}>
          <View style={dashboardStyles.progressHeader}>
            <Text style={dashboardStyles.progressTitle}>Overall Progress</Text>

            <Text style={dashboardStyles.progressCount}>
              {completedActivities} of {totalActivities} completed
            </Text>
          </View>

          <View style={dashboardStyles.progressTrack}>
            <Animated.View
              style={[
                dashboardStyles.progressFill,
                {
                  width: progressAnimation.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                    extrapolate: "clamp",
                  }),
                },
              ]}
            />
          </View>

          <Text style={dashboardStyles.progressDescription}>
            {totalActivities === 0
              ? "No activities are available yet."
              : completedActivities === totalActivities
                ? "All activities are complete. Great work!"
                : "Open an activity and mark it complete to update your progress."}
          </Text>
        </View>

        <View style={dashboardStyles.focusCard}>
          <View style={dashboardStyles.focusHeader}>
            <View>
              <Text style={dashboardStyles.focusTitle}>Focus Timer</Text>

              <Text style={dashboardStyles.focusDescription}>
                {todayFocusMinutes} of {settings.dailyGoalMinutes} focus minutes
                completed today
              </Text>
            </View>

            <Pressable
              onPress={() =>
                navigation.navigate("Activities", {
                  screen: "FocusTimer",
                })
              }
              accessibilityRole="button"
              accessibilityLabel="Open Focus Timer"
              style={({ pressed }) => [
                dashboardStyles.focusButton,
                pressed && dashboardStyles.pressedFocusButton,
              ]}
            >
              <Text style={dashboardStyles.focusButtonText}>Open</Text>
            </Pressable>
          </View>

          <View style={dashboardStyles.focusStats}>
            <View>
              <Text style={dashboardStyles.focusStatValue}>
                {todayFocusMinutes}
              </Text>

              <Text style={dashboardStyles.focusStatLabel}>Focus minutes</Text>
            </View>

            <View>
              <Text style={dashboardStyles.focusStatValue}>
                {completedFocusSessions}
              </Text>

              <Text style={dashboardStyles.focusStatLabel}>Sessions</Text>
            </View>

            <View>
              <Text style={dashboardStyles.focusStatValue}>
                {dailyGoalProgress}%
              </Text>

              <Text style={dashboardStyles.focusStatLabel}>Daily goal</Text>
            </View>
          </View>

          <View style={dashboardStyles.focusProgressTrack}>
            <View
              style={[
                dashboardStyles.focusProgressFill,
                {
                  width: `${dailyGoalProgress}%`,
                },
              ]}
            />
          </View>
        </View>

        <View style={dashboardStyles.sectionHeader}>
          <Text style={dashboardStyles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={dashboardStyles.quickActions}>
          <Pressable
            onPress={() =>
              navigation.navigate("Activities", {
                screen: "ActivitiesList",
              })
            }
            accessibilityRole="button"
            accessibilityLabel="View all activities"
            style={({ pressed }) => [
              dashboardStyles.quickAction,
              pressed && dashboardStyles.pressedAction,
            ]}
          >
            <Ionicons name="grid-outline" size={22} color={theme.accent} />

            <Text style={dashboardStyles.quickActionTitle}>All Activities</Text>

            <Text style={dashboardStyles.quickActionDescription}>
              Browse every activity
            </Text>
          </Pressable>

          <Pressable
            onPress={handleContinueLearning}
            accessibilityRole="button"
            accessibilityLabel="Continue learning"
            style={({ pressed }) => [
              dashboardStyles.quickAction,
              pressed && dashboardStyles.pressedAction,
            ]}
          >
            <Ionicons name="play-circle-outline" size={22} color="#047857" />

            <Text style={dashboardStyles.quickActionTitle}>
              Continue Learning
            </Text>

            <Text style={dashboardStyles.quickActionDescription}>
              {continueLearningActivity
                ? continueLearningActivity.title
                : "No activities available"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("Profile")}
            accessibilityRole="button"
            accessibilityLabel="View profile"
            style={({ pressed }) => [
              dashboardStyles.quickAction,
              pressed && dashboardStyles.pressedAction,
            ]}
          >
            <Ionicons name="person-outline" size={22} color="#7C3AED" />

            <Text style={dashboardStyles.quickActionTitle}>View Profile</Text>

            <Text style={dashboardStyles.quickActionDescription}>
              Manage your settings
            </Text>
          </Pressable>
        </View>

        <View style={dashboardStyles.sectionHeader}>
          <Text style={dashboardStyles.sectionTitle}>Recent Activities</Text>
        </View>

        {recentActivities.length === 0 ? (
          <View style={dashboardStyles.emptyState}>
            <Ionicons name="compass-outline" size={28} color={theme.text} />

            <Text style={dashboardStyles.emptyTitle}>
              No recent activity yet
            </Text>

            <Text style={dashboardStyles.emptyDescription}>
              Open an activity and it will appear here so you can continue where
              you left off.
            </Text>
          </View>
        ) : (
          recentActivities.map((activity) => (
            <ActivityCard
              key={activity.number}
              activity={activity}
              completed={completedActivityIds.includes(activity.number)}
              onToggleComplete={() => toggleActivityCompletion(activity.number)}
              onOpen={() => handleRecentActivityOpen(activity)}
            />
          ))
        )}

        <View style={dashboardStyles.sectionHeader}>
          <Text style={dashboardStyles.sectionTitle}>All Activities</Text>
        </View>

        {activities.map((activity) => (
          <ActivityCard
            key={activity.number}
            activity={activity}
            completed={completedActivityIds.includes(activity.number)}
            onToggleComplete={() => toggleActivityCompletion(activity.number)}
            onOpen={() => {
              openActivity(activity.route);
            }}
          />
        ))}
      </Animated.View>
    </ScrollView>
  );
}

const createDashboardStyles = (theme) =>
  StyleSheet.create({
    dashboard: {
      gap: 18,
    },
    errorBanner: {
      backgroundColor: theme.surface,
      borderColor: theme.error,
      borderWidth: 1,
      borderRadius: 14,
      padding: 12,
    },
    errorText: {
      color: theme.error,
      fontSize: 13,
      fontWeight: "500",
    },
    summaryRow: {
      flexDirection: "row",
      gap: 12,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      gap: 8,
    },
    summaryIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
    },
    summaryValue: {
      fontSize: 26,
      fontWeight: "700",
      color: theme.text,
    },
    summaryLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.text,
      opacity: 0.65,
    },
    progressCard: {
      backgroundColor: theme.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 18,
      gap: 12,
    },
    progressHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    progressTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
    },
    progressCount: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.text,
      opacity: 0.65,
    },
    progressTrack: {
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 5,
      backgroundColor: theme.accent,
    },
    progressDescription: {
      fontSize: 13,
      color: theme.text,
      opacity: 0.7,
      lineHeight: 18,
    },
    focusCard: {
      backgroundColor: theme.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 18,
      gap: 14,
    },
    focusHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    focusTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
    },
    focusDescription: {
      fontSize: 13,
      color: theme.text,
      opacity: 0.7,
      marginTop: 3,
    },
    focusButton: {
      backgroundColor: theme.accent,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    pressedFocusButton: {
      opacity: 0.75,
      transform: [{ scale: 0.98 }],
    },
    focusButtonText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "700",
    },
    focusStats: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    focusStatValue: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.text,
    },
    focusStatLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.text,
      opacity: 0.65,
      marginTop: 2,
    },
    focusProgressTrack: {
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
    },
    focusProgressFill: {
      height: "100%",
      backgroundColor: "#047857",
    },
    sectionHeader: {
      marginTop: 6,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
    },
    quickActions: {
      gap: 12,
    },
    quickAction: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 18,
      padding: 16,
    },
    pressedAction: {
      opacity: 0.75,
      transform: [{ scale: 0.98 }],
    },
    quickActionTitle: {
      flex: 1,
      fontSize: 15,
      fontWeight: "700",
      color: theme.text,
    },
    quickActionDescription: {
      position: "absolute",
      right: 16,
      bottom: 12,
      fontSize: 11,
      color: theme.text,
      opacity: 0.55,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 18,
      padding: 24,
      gap: 10,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
    },
    emptyDescription: {
      textAlign: "center",
      fontSize: 13,
      lineHeight: 19,
      color: theme.text,
      opacity: 0.7,
    },
  });
