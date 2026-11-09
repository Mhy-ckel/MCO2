import { StyleSheet } from "react-native";
import { themes } from "./theme/palettes";

export { themes } from "./theme/palettes";

export function createActivityStyles(theme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },

    content: {
      padding: 20,
      paddingBottom: 32,
    },

    page: {
      width: "100%",
      maxWidth: 600,
      alignSelf: "center",
    },

    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      backgroundColor: theme.background,
    },

    title: {
      fontSize: 26,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 8,
    },

    description: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.secondary,
      marginBottom: 20,
    },

    card: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 18,
      marginBottom: 16,
    },

    badge: {
      color: theme.accent,
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 8,
    },

    cardTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 8,
    },

    text: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.text,
    },

    muted: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.secondary,
    },

    label: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.label,
      marginBottom: 8,
    },

    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      backgroundColor: theme.input,
      padding: 12,
      fontSize: 16,
      color: theme.text,
      marginBottom: 12,
    },

    noteInput: {
      minHeight: 90,
      maxHeight: 140,
      textAlignVertical: "top",
    },

    button: {
      backgroundColor: theme.button,
      paddingVertical: 13,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: "center",
    },

    buttonText: {
      color: theme.buttonText,
      fontSize: 16,
      fontWeight: "600",
      textAlign: "center",
    },

    disabled: {
      opacity: 0.5,
    },

    status: {
      fontSize: 15,
      color: theme.secondary,
      marginVertical: 12,
    },

    error: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.error,
      marginVertical: 12,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    flex: {
      flex: 1,
    },

    spacer: {
      marginTop: 20,
    },

    actions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 12,
    },

    smallButton: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 8,
      marginLeft: 8,
    },

    editButton: {
      backgroundColor: theme.editBackground,
    },

    deleteButton: {
      backgroundColor: theme.deleteBackground,
    },

    editText: {
      color: theme.editText,
      fontWeight: "600",
    },

    deleteText: {
      color: theme.deleteText,
      fontWeight: "600",
    },

    cancelButton: {
      padding: 12,
      alignItems: "center",
    },
  });
}

// Compatibility export. Updated screens use useAppTheme().
export const styles = createActivityStyles(themes.light);
