import { StyleSheet } from "react-native";
import { themes } from "./theme/palettes";

export function createHubStyles(theme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },

    scrollContent: {
      padding: 20,
      paddingBottom: 32,
    },

    page: {
      width: "100%",
      maxWidth: 600,
      alignSelf: "center",
    },

    hero: {
      backgroundColor: theme.hero,
      borderRadius: 20,
      padding: 24,
      marginBottom: 28,
    },

    eyebrow: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.5,
      color: theme.heroEyebrow,
      marginBottom: 18,
    },

    welcome: {
      fontSize: 16,
      color: theme.heroSecondary,
      marginBottom: 8,
    },

    heroTitle: {
      fontSize: 30,
      lineHeight: 38,
      fontWeight: "800",
      color: theme.heroText,
      marginBottom: 14,
    },

    heroDescription: {
      fontSize: 16,
      lineHeight: 25,
      color: theme.heroSecondary,
      marginBottom: 22,
    },

    heroButton: {
      alignSelf: "flex-start",
      backgroundColor: theme.heroButton,
      borderRadius: 10,
      paddingHorizontal: 22,
      paddingVertical: 13,
    },

    heroButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.heroButtonText,
    },

    sectionTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 8,
    },

    sectionDescription: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.hubSecondary,
      marginBottom: 20,
    },

    card: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: theme.hubBorder,
    },

    badge: {
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      marginBottom: 14,
    },

    badgeText: {
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.5,
    },

    cardTitle: {
      fontSize: 21,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 10,
    },

    cardDescription: {
      fontSize: 15,
      lineHeight: 24,
      color: theme.hubSecondary,
      marginBottom: 18,
    },

    cardButton: {
      paddingHorizontal: 18,
      paddingVertical: 13,
      borderRadius: 10,
      alignItems: "center",
    },

    buttonText: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.buttonText,
    },

    pressed: {
      opacity: 0.75,
    },

    profileCard: {
      alignItems: "center",
      paddingVertical: 28,
      marginBottom: 12,
    },

    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.selected,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },

    avatarText: {
      fontSize: 32,
      fontWeight: "700",
      color: theme.accent,
    },

    profileName: {
      fontSize: 26,
      fontWeight: "700",
      color: theme.text,
      textAlign: "center",
      marginBottom: 6,
    },

    profileSubtitle: {
      fontSize: 15,
      color: theme.hubSecondary,
      textAlign: "center",
    },

    infoLabel: {
      fontSize: 13,
      color: theme.hubSecondary,
      marginTop: 12,
      marginBottom: 4,
    },

    infoValue: {
      fontSize: 17,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 14,
    },
  });
}

export const hubStyles = createHubStyles(themes.light);
