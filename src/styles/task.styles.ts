import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  empty: {
    fontSize: 14,
    color: "#71717a",
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fafafa",
  },
  image: {
    width: "100%",
    height: 160,
  },
  body: {
    padding: 12,
    gap: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    flexShrink: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusActive: {
    backgroundColor: "#dcfce7",
  },
  statusPast: {
    backgroundColor: "#e4e4e7",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#e4e4e7",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  meta: {
    fontSize: 12,
    color: "#71717a",
  },
  codesHeading: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
  },
  codesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  codeChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#f4f4f5",
  },
  codeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
