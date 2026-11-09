import { StyleSheet } from "react-native";

export const themes = {
  light: {
    background: "#F1F5F9",
    surface: "#FFFFFF",
    text: "#0F172A",
    secondary: "#475569",
    border: "#CBD5E1",
    accent: "#2563EB",
  },

  dark: {
    background: "#0F172A",
    surface: "#1E293B",
    text: "#F8FAFC",
    secondary: "#CBD5E1",
    border: "#475569",
    accent: "#93C5FD",
  },
};

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F1F5F9",
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
    backgroundColor: "#F1F5F9",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#475569",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
  },

  badge: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },

  text: {
    fontSize: 16,
    lineHeight: 24,
    color: "#0F172A",
  },

  muted: {
    fontSize: 15,
    lineHeight: 22,
    color: "#475569",
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    padding: 12,
    fontSize: 16,
    color: "#0F172A",
    marginBottom: 12,
  },

  noteInput: {
    minHeight: 90,
    maxHeight: 140,
    textAlignVertical: "top",
  },

  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  disabled: {
    opacity: 0.5,
  },

  status: {
    fontSize: 15,
    color: "#475569",
    marginVertical: 12,
  },

  error: {
    fontSize: 15,
    lineHeight: 22,
    color: "#B91C1C",
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
    backgroundColor: "#DBEAFE",
  },

  deleteButton: {
    backgroundColor: "#FEE2E2",
  },

  editText: {
    color: "#1D4ED8",
    fontWeight: "600",
  },

  deleteText: {
    color: "#B91C1C",
    fontWeight: "600",
  },

  cancelButton: {
    padding: 12,
    alignItems: "center",
  },
});
