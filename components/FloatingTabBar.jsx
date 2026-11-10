import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/useAppTheme";

const TABS = [
  {
    key: "Home",
    label: "Home",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    key: "Activities",
    label: "Activities",
    icon: "grid-outline",
    activeIcon: "grid",
  },
  {
    key: "Profile",
    label: "Profile",
    icon: "person-outline",
    activeIcon: "person",
  },
];

export default function FloatingTabBar({ state, navigation }) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState("Home");

  const indicatorX = useRef(new Animated.Value(0)).current;
  const pillWidth = useRef(0);

  const entranceOpacity = useRef(new Animated.Value(0)).current;
  const entranceTranslateY = useRef(new Animated.Value(20)).current;

  const iconScales = useRef(
    TABS.reduce((accumulator, tab) => {
      accumulator[tab.key] = new Animated.Value(1);
      return accumulator;
    }, {}),
  ).current;

  const pressScales = useRef(
    TABS.reduce((accumulator, tab) => {
      accumulator[tab.key] = new Animated.Value(1);
      return accumulator;
    }, {}),
  ).current;

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
    const currentRoute = state?.routes?.[state.index]?.name;

    if (currentRoute && TABS.some((tab) => tab.key === currentRoute)) {
      setActiveTab(currentRoute);
    }
  }, [state?.index, state?.routes]);

  useEffect(() => {
    const index = TABS.findIndex((tab) => tab.key === activeTab);

    if (index === -1 || !pillWidth.current) {
      return;
    }

    const tabWidth = pillWidth.current / TABS.length;

    Animated.spring(indicatorX, {
      toValue: index * tabWidth,
      useNativeDriver: true,
      friction: 8,
      tension: 75,
    }).start();
  }, [activeTab, pillWidth.current, indicatorX]);

  const handleTabPressIn = (tabKey) => {
    Animated.spring(pressScales[tabKey], {
      toValue: 0.94,
      useNativeDriver: true,
      friction: 7,
      tension: 180,
    }).start();
  };

  const handleTabPressOut = (tabKey) => {
    Animated.spring(pressScales[tabKey], {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 170,
    }).start();
  };

  const handleTabPress = (tabKey) => {
    setActiveTab(tabKey);
    navigation.navigate(tabKey);

    Animated.sequence([
      Animated.spring(iconScales[tabKey], {
        toValue: 1.14,
        useNativeDriver: true,
        friction: 6,
        tension: 220,
      }),
      Animated.spring(iconScales[tabKey], {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 170,
      }),
    ]).start();
  };

  const handlePillLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    pillWidth.current = width;

    const index = TABS.findIndex((tab) => tab.key === activeTab);

    if (index !== -1) {
      indicatorX.setValue(index * (width / TABS.length));
    }
  };

  const colors = {
    background:
      theme.tabBarBackground || (theme.isDark ? "#101318" : "#F7F8FB"),
    pill: theme.tabBarPill || (theme.isDark ? "#1D232C" : "#FFFFFF"),
    border:
      theme.tabBarBorder ||
      (theme.isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(15, 23, 42, 0.08)"),
    selection: theme.tabBarSelection || (theme.isDark ? "#2C3542" : "#EDF2F9"),
    active: theme.tabBarActive || (theme.isDark ? "#FFFFFF" : "#111827"),
    inactive:
      theme.tabBarInactive ||
      (theme.isDark ? "rgba(235, 241, 255, 0.60)" : "rgba(17, 24, 39, 0.52)"),
    topHighlight: theme.isDark
      ? "rgba(255, 255, 255, 0.12)"
      : "rgba(255, 255, 255, 0.95)",
    midHighlight: theme.isDark
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(255, 255, 255, 0.55)",
    bottomHighlight: theme.isDark
      ? "rgba(255, 255, 255, 0.03)"
      : "rgba(255, 255, 255, 0.30)",
    selectionHighlight: theme.isDark
      ? "rgba(255, 255, 255, 0.16)"
      : "rgba(255, 255, 255, 0.98)",
    selectionLower: theme.isDark
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(255, 255, 255, 0.40)",
    selectionEdge: theme.isDark
      ? "rgba(255, 255, 255, 0.12)"
      : "rgba(15, 23, 42, 0.07)",
    shadow: theme.isDark ? "#000000" : "#0F172A",
  };

  const styles = createStyles(colors, insets);

  return (
    <Animated.View
      style={[
        styles.navigationArea,
        {
          opacity: entranceOpacity,
          transform: [{ translateY: entranceTranslateY }],
        },
      ]}
    >
      <View style={styles.pill} onLayout={handlePillLayout}>
        <View style={styles.pillBase} />

        <View style={styles.pillTopHighlight} />

        <View style={styles.pillMidHighlight} />

        <View style={styles.pillBottomHighlight} />

        <Animated.View
          style={[
            styles.selectionIndicator,
            {
              backgroundColor: colors.selection,
              transform: [{ translateX: indicatorX }],
            },
          ]}
        >
          <View style={styles.selectionHighlight} />
          <View style={styles.selectionLowerHighlight} />
          <View style={styles.selectionEdge} />
        </Animated.View>

        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <Animated.View
              key={tab.key}
              style={[
                styles.tabButtonWrapper,
                {
                  transform: [{ scale: pressScales[tab.key] }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.tabButton}
                activeOpacity={1}
                onPressIn={() => handleTabPressIn(tab.key)}
                onPressOut={() => handleTabPressOut(tab.key)}
                onPress={() => handleTabPress(tab.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={tab.label}
              >
                <Animated.View
                  style={[
                    styles.iconContainer,
                    {
                      transform: [{ scale: iconScales[tab.key] }],
                    },
                  ]}
                >
                  <Ionicons
                    name={isActive ? tab.activeIcon : tab.icon}
                    size={22}
                    color={isActive ? colors.active : colors.inactive}
                  />
                </Animated.View>

                <Animated.Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive ? colors.active : colors.inactive,
                      opacity: isActive ? 1 : 0.78,
                    },
                  ]}
                >
                  {tab.label}
                </Animated.Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </Animated.View>
  );
}

const createStyles = (colors, insets) =>
  StyleSheet.create({
    navigationArea: {
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 10,
      paddingBottom: Math.max(insets.bottom, 14),
      backgroundColor: colors.background,
      flexShrink: 0,
    },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "88%",
      maxWidth: 430,
      height: 68,
      borderRadius: 34,
      backgroundColor: colors.pill,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 8,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOpacity: 0.18,
          shadowRadius: 22,
          shadowOffset: {
            width: 0,
            height: 10,
          },
        },
        android: {
          elevation: 10,
        },
      }),
    },
    pillBase: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.pill,
    },
    pillTopHighlight: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "38%",
      backgroundColor: colors.topHighlight,
      opacity: 0.45,
    },
    pillMidHighlight: {
      position: "absolute",
      top: "34%",
      left: 0,
      right: 0,
      height: "24%",
      backgroundColor: colors.midHighlight,
      opacity: 0.3,
    },
    pillBottomHighlight: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "32%",
      backgroundColor: colors.bottomHighlight,
      opacity: 0.35,
    },
    selectionIndicator: {
      position: "absolute",
      top: 6,
      bottom: 6,
      left: 6,
      width: "33.333%",
      borderRadius: 28,
      overflow: "hidden",
    },
    selectionHighlight: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "48%",
      backgroundColor: colors.selectionHighlight,
      opacity: 0.6,
    },
    selectionLowerHighlight: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "34%",
      backgroundColor: colors.selectionLower,
      opacity: 0.45,
    },
    selectionEdge: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: colors.selectionEdge,
    },
    tabButtonWrapper: {
      flex: 1,
      height: "100%",
    },
    tabButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
    },
    iconContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    tabLabel: {
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 0.2,
    },
  });
