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

import { useAppTheme } from "../theme/useAppTheme";

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

const INNER_PADDING = 6;

export default function FloatingTabBar({ state, descriptors, navigation }) {
  const { theme, darkMode } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [barWidth, setBarWidth] = useState(0);
  const indicatorPosition = useRef(new Animated.Value(0)).current;

  const tabWidth =
    barWidth > 0 ? (barWidth - INNER_PADDING * 2) / state.routes.length : 0;

  useEffect(() => {
    if (!tabWidth) {
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
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <View
        style={[
          styles.shadowContainer,
          {
            backgroundColor: theme.surface,
            shadowColor: theme.shadow,
          },
        ]}
      >
        <View
          style={[
            styles.pill,
            {
              backgroundColor: theme.pill,
              borderColor: theme.pillBorder,
            },
          ]}
          onLayout={(event) => {
            setBarWidth(event.nativeEvent.layout.width);
          }}
        >
          {Platform.OS === "ios" ? (
            <BlurView
              intensity={65}
              tint={darkMode ? "dark" : "light"}
              pointerEvents="none"
              style={StyleSheet.absoluteFillObject}
            />
          ) : (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                {
                  backgroundColor: theme.pillAndroid,
                },
              ]}
            />
          )}

          {tabWidth > 0 && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.indicator,
                {
                  width: tabWidth,
                  backgroundColor: theme.selected,
                  transform: [
                    {
                      translateX: indicatorPosition,
                    },
                  ],
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

              return (
                <Pressable
                  key={route.key}
                  onPress={handlePress}
                  onLongPress={() => {
                    navigation.emit({
                      type: "tabLongPress",
                      target: route.key,
                    });
                  }}
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
                    color={focused ? theme.accent : theme.secondary}
                  />

                  <Text
                    numberOfLines={1}
                    style={[
                      styles.label,
                      {
                        color: focused ? theme.accent : theme.secondary,
                        fontWeight: focused ? "700" : "500",
                      },
                    ]}
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
  },

  shadowContainer: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 36,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },

  pill: {
    height: 70,
    borderRadius: 36,
    overflow: "hidden",
    borderWidth: 1,
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
  },

  label: {
    marginTop: 4,
    fontSize: 11,
  },

  pressed: {
    opacity: 0.65,
    transform: [{ scale: 0.96 }],
  },
});
