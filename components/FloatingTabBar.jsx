import React, { useEffect, useRef, useState } from "react";

import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { BlurView } from "expo-blur";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_ICONS = {
  Home: {
    active: "home",
    inactive: "home-outline",
  },
  Activities: {
    active: "grid",
    inactive: "grid-outline",
  },
  Profile: {
    active: "person",
    inactive: "person-outline",
  },
};

const BAR_HEIGHT = 70;
const INNER_PADDING = 6;

export default function FloatingTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  const [barWidth, setBarWidth] = useState(0);
  const indicatorPosition = useRef(new Animated.Value(0)).current;

  const bottomSpacing = Math.max(insets.bottom, 12);

  const tabWidth =
    barWidth > 0 ? (barWidth - INNER_PADDING * 2) / state.routes.length : 0;

  useEffect(() => {
    if (tabWidth === 0) {
      return;
    }

    const animation = Animated.spring(indicatorPosition, {
      toValue: state.index * tabWidth,
      damping: 22,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver: true,
    });

    animation.start();

    return () => animation.stop();
  }, [state.index, tabWidth, indicatorPosition]);

  return (
    <View style={[styles.container, { paddingBottom: bottomSpacing }]}>
      <View style={styles.shadowContainer}>
        <View
          style={styles.pill}
          onLayout={(event) => {
            setBarWidth(event.nativeEvent.layout.width);
          }}
        >
          {Platform.OS === "ios" ? (
            <BlurView
              intensity={65}
              tint="light"
              pointerEvents="none"
              style={StyleSheet.absoluteFillObject}
            />
          ) : (
            <View
              pointerEvents="none"
              style={[StyleSheet.absoluteFillObject, styles.androidBackground]}
            />
          )}

          {tabWidth > 0 && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.indicator,
                {
                  width: tabWidth,
                  transform: [{ translateX: indicatorPosition }],
                },
              ]}
            />
          )}

          <View style={styles.tabs}>
            {state.routes.map((route, index) => {
              const focused = state.index === index;
              const options = descriptors[route.key].options;

              const label =
                typeof options.tabBarLabel === "string"
                  ? options.tabBarLabel
                  : route.name;

              const icons = TAB_ICONS[route.name] || {
                active: "ellipse",
                inactive: "ellipse-outline",
              };

              function handlePress() {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              }

              function handleLongPress() {
                navigation.emit({
                  type: "tabLongPress",
                  target: route.key,
                });
              }

              return (
                <Pressable
                  key={route.key}
                  onPress={handlePress}
                  onLongPress={handleLongPress}
                  accessibilityRole="tab"
                  accessibilityState={{
                    selected: focused,
                  }}
                  accessibilityLabel={
                    options.tabBarAccessibilityLabel || `${label} tab`
                  }
                  style={({ pressed }) => [
                    styles.tab,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name={focused ? icons.active : icons.inactive}
                    size={22}
                    color={focused ? "#2563EB" : "#64748B"}
                  />

                  <Text
                    numberOfLines={1}
                    style={[styles.label, focused && styles.activeLabel]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 10,
    paddingHorizontal: 18,
    backgroundColor: "#F1F5F9",
  },

  shadowContainer: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,

    elevation: 8,
  },

  pill: {
    height: BAR_HEIGHT,
    borderRadius: 36,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
    backgroundColor: "rgba(255, 255, 255, 0.82)",
  },

  androidBackground: {
    backgroundColor: "rgba(255, 255, 255, 0.94)",
  },

  tabs: {
    flex: 1,
    flexDirection: "row",
    padding: INNER_PADDING,
  },

  tab: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
  },

  indicator: {
    position: "absolute",
    top: INNER_PADDING,
    bottom: INNER_PADDING,
    left: INNER_PADDING,
    borderRadius: 30,
    backgroundColor: "#DBEAFE",
  },

  label: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
  },

  activeLabel: {
    color: "#2563EB",
    fontWeight: "700",
  },

  pressed: {
    opacity: 0.65,
    transform: [{ scale: 0.96 }],
  },
});
