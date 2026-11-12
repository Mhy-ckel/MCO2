// components/CustomDrawerContent.jsx

import React, { useContext } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { UserContext } from "../activities/activity6/UserContext";
import { useAppTheme } from "../theme/useAppTheme";

function getInitials(name) {
  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return "S";
  }

  const nameParts = trimmedName.split(" ").filter(Boolean);

  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }

  return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(
    0,
  )}`.toUpperCase();
}

export default function CustomDrawerContent(props) {
  const { displayName } = useContext(UserContext);
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const { state, navigation } = props;

  const mainTabsRoute = state.routes[state.index];
  const tabState = mainTabsRoute?.state;

  const activeTabName = tabState?.routes?.[tabState.index]?.name;

  const profileRoute = tabState?.routes?.find(
    (route) => route.name === "Profile",
  );
  const profileState = profileRoute?.state;
  const activeProfileScreen = profileState?.routes?.[profileState.index]?.name;

  const navigationItems = [
    {
      label: "Home",
      icon: "home-outline",
      isActive: activeTabName === "Home",
      action: () => {
        navigation.closeDrawer();
        navigation.navigate("MainTabs", {
          screen: "Home",
        });
      },
    },
    {
      label: "Activities",
      icon: "grid-outline",
      isActive: activeTabName === "Activities",
      action: () => {
        navigation.closeDrawer();
        navigation.navigate("MainTabs", {
          screen: "Activities",
          params: {
            screen: "ActivitiesList",
          },
        });
      },
    },
    {
      label: "Planner",
      icon: "calendar-outline",
      isActive: activeTabName === "Planner",
      action: () => {
        navigation.closeDrawer();
        navigation.navigate("MainTabs", {
          screen: "Planner",
          params: {
            screen: "PlannerHome",
          },
        });
      },
    },
    {
      label: "Profile",
      icon: "person-outline",
      isActive:
        activeTabName === "Profile" && activeProfileScreen !== "Settings",
      action: () => {
        navigation.closeDrawer();
        navigation.navigate("MainTabs", {
          screen: "Profile",
          params: {
            screen: "ProfileHome",
          },
        });
      },
    },
    {
      label: "Settings & Preferences",
      icon: "settings-outline",
      isActive:
        activeTabName === "Profile" && activeProfileScreen === "Settings",
      action: () => {
        navigation.closeDrawer();
        navigation.navigate("MainTabs", {
          screen: "Profile",
          params: {
            screen: "Settings",
          },
        });
      },
    },
  ];

  const styles = createDrawerStyles(theme);
  const safeDisplayName =
    displayName && displayName.trim().length > 0
      ? displayName.trim()
      : "Student";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(safeDisplayName)}</Text>
        </View>

        <View style={styles.profileDetails}>
          <Text numberOfLines={1} style={styles.profileName}>
            {safeDisplayName}
          </Text>

          <Text style={styles.profileRole}>Student</Text>
        </View>

        <Pressable
          onPress={() => navigation.closeDrawer()}
          accessibilityRole="button"
          accessibilityLabel="Close navigation drawer"
          hitSlop={12}
          style={({ pressed }) => [
            styles.closeButton,
            pressed && styles.pressedCloseButton,
          ]}
        >
          <Ionicons name="close" size={22} color={theme.text} />
        </Pressable>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Navigation</Text>

        {navigationItems.map((item) => (
          <Pressable
            key={item.label}
            onPress={item.action}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: item.isActive }}
            style={({ pressed }) => [
              styles.navigationItem,
              item.isActive && styles.activeNavigationItem,
              pressed && styles.pressedNavigationItem,
            ]}
          >
            <View
              style={[
                styles.navigationIcon,
                item.isActive && styles.activeNavigationIcon,
              ]}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={item.isActive ? "#FFFFFF" : theme.text}
              />
            </View>

            <Text
              numberOfLines={1}
              style={[
                styles.navigationLabel,
                item.isActive && styles.activeNavigationLabel,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>More</Text>

        <View style={styles.aboutItem}>
          <View style={styles.navigationIcon}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={theme.text}
            />
          </View>

          <View style={styles.aboutDetails}>
            <Text numberOfLines={1} style={styles.navigationLabel}>
              About ActivityHub
            </Text>

            <Text style={styles.aboutDescription}>
              Build React Native skills one activity at a time.
            </Text>
          </View>
        </View>
      </DrawerContentScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Text style={styles.footerText}>ActivityHub</Text>

        <Text style={styles.footerSubtext}>
          Build React Native skills one activity at a time.
        </Text>
      </View>
    </View>
  );
}

const createDrawerStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.surface,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 18,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    avatar: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.accent,
    },
    avatarText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "800",
    },
    profileDetails: {
      flex: 1,
    },
    profileName: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "700",
    },
    profileRole: {
      color: theme.text,
      fontSize: 12,
      fontWeight: "600",
      opacity: 0.65,
      marginTop: 2,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
    },
    pressedCloseButton: {
      opacity: 0.7,
      transform: [{ scale: 0.96 }],
    },
    scrollContent: {
      paddingHorizontal: 12,
      paddingTop: 16,
      paddingBottom: 16,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1,
      opacity: 0.55,
      marginBottom: 10,
      marginLeft: 8,
      textTransform: "uppercase",
    },
    navigationItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 14,
      marginBottom: 6,
      minHeight: 52,
      paddingHorizontal: 10,
    },
    activeNavigationItem: {
      backgroundColor: theme.accent,
    },
    pressedNavigationItem: {
      opacity: 0.75,
      transform: [{ scale: 0.99 }],
    },
    navigationIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
    },
    activeNavigationIcon: {
      backgroundColor: "rgba(255, 255, 255, 0.18)",
    },
    navigationLabel: {
      flex: 1,
      color: theme.text,
      fontSize: 15,
      fontWeight: "600",
    },
    activeNavigationLabel: {
      color: "#FFFFFF",
      fontWeight: "700",
    },
    aboutItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 14,
      minHeight: 52,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    aboutDetails: {
      flex: 1,
    },
    aboutDescription: {
      color: theme.text,
      fontSize: 12,
      lineHeight: 16,
      opacity: 0.65,
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: 16,
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingHorizontal: 16,
      paddingTop: 14,
    },
    footerText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "800",
    },
    footerSubtext: {
      color: theme.text,
      fontSize: 12,
      lineHeight: 17,
      marginTop: 4,
      opacity: 0.65,
    },
  });
