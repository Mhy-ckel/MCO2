import { StyleSheet } from "react-native";

export const hubStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F1F5F9",
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
    backgroundColor: "#1E3A8A",
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#BFDBFE",
    marginBottom: 18,
  },

  welcome: {
    fontSize: 16,
    color: "#DBEAFE",
    marginBottom: 8,
  },

  heroTitle: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 14,
  },

  heroDescription: {
    fontSize: 16,
    lineHeight: 25,
    color: "#DBEAFE",
    marginBottom: 22,
  },

  heroButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },

  heroButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E3A8A",
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },

  sectionDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: "#64748B",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
    color: "#0F172A",
    marginBottom: 10,
  },

  cardDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: "#64748B",
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
    color: "#FFFFFF",
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
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#2563EB",
  },

  profileName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 6,
  },

  profileSubtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
  },

  infoLabel: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 12,
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 17,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 14,
  },
});
