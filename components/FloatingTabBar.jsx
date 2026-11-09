import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
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
      tension: 70,
    }).start();
  }, [activeTab, pillWidth.current, indicatorX]);

  const handleTabPress = (tabKey) => {
    setActiveTab(tabKey);
    navigation.navigate(tabKey);
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
    pill: theme.tabBarPill || (theme.isDark ? "#1B2028" : "#FFFFFF"),
    border:
      theme.tabBarBorder ||
      (theme.isDark ? "rgba(255, 255, 255, 0.10)" : "rgba(15, 23, 42, 0.08)"),
    selection: theme.tabBarSelection || (theme.isDark ? "#2A3240" : "#EEF2F8"),
    active: theme.tabBarActive || (theme.isDark ? "#FFFFFF" : "#111827"),
    inactive:
      theme.tabBarInactive ||
      (theme.isDark ? "rgba(235, 241, 255, 0.62)" : "rgba(17, 24, 39, 0.55)"),
    highlight: theme.isDark
      ? "rgba(255, 255, 255, 0.10)"
      : "rgba(255, 255, 255, 0.90)",
    lowerHighlight: theme.isDark
      ? "rgba(255, 255, 255, 0.04)"
      : "rgba(255, 255, 255, 0.45)",
    selectionHighlight: theme.isDark
      ? "rgba(255, 255, 255, 0.14)"
      : "rgba(255, 255, 255, 0.95)",
    selectionEdge: theme.isDark
      ? "rgba(255, 255, 255, 0.10)"
      : "rgba(15, 23, 42, 0.06)",
    shadow: theme.isDark ? "#000000" : "#0F172A",
  };

  const styles = createStyles(colors, insets);

  return (
    <View style={styles.navigationArea}>
      <View style={styles.pill} onLayout={handlePillLayout}>
        <View style={styles.pillBase} />

        <View style={styles.pillTopHighlight} />

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
          <View style={styles.selectionEdge} />
        </Animated.View>

        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              activeOpacity={0.8}
              onPress={() => handleTabPress(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
            >
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={isActive ? colors.active : colors.inactive}
              />

              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? colors.active : colors.inactive,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
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
      height: 66,
      borderRadius: 33,
      backgroundColor: colors.pill,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 8,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOpacity: 0.16,
          shadowRadius: 18,
          shadowOffset: {
            width: 0,
            height: 8,
          },
        },
        android: {
          elevation: 8,
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
      height: "52%",
      backgroundColor: colors.highlight,
      opacity: 0.35,
    },
    pillBottomHighlight: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "30%",
      backgroundColor: colors.lowerHighlight,
      opacity: 0.18,
    },
    selectionIndicator: {
      position: "absolute",
      top: 6,
      bottom: 6,
      left: 6,
      width: "33.333%",
      borderRadius: 27,
      overflow: "hidden",
    },
    selectionHighlight: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "55%",
      backgroundColor: colors.selectionHighlight,
      opacity: 0.55,
    },
    selectionEdge: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      borderRadius: 27,
      borderWidth: 1,
      borderColor: colors.selectionEdge,
    },
    tabButton: {
      flex: 1,
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
    },
    tabLabel: {
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 0.2,
    },
  });
