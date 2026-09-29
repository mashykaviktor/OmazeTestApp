import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function Index() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Mobile Engineer Interview</Text>

      <Text style={styles.paragraph}>
        Build a single screen that shows all draws the current user has
        entered.
      </Text>

      <Text style={styles.subheading}>Each item in the list must show:</Text>
      <Text style={styles.listItem}>• Draw image</Text>
      <Text style={styles.listItem}>• Draw title</Text>
      <Text style={styles.listItem}>
        • Draw type (house, early bird, monthly millionaire)
      </Text>
      <Text style={styles.listItem}>
        • Whether the draw is active or past
      </Text>
      <Text style={styles.listItem}>
        • Total number of entry codes the user holds for that draw
      </Text>
      <Text style={styles.listItem}>• The individual entry codes</Text>

      <Text style={styles.subheading}>The list must:</Text>
      <Text style={styles.listItem}>• Be scrollable and performant</Text>
      <Text style={styles.listItem}>
        • Show active draws before past draws
      </Text>

      <Text style={styles.paragraph}>
        Data lives in src/data/draws.json and src/data/entries.json. The
        current user&apos;s id is hardcoded as &quot;user_123&quot;.
      </Text>

      <Text style={styles.paragraph}>Write at least one test.</Text>

      <Link href="/task" style={styles.link}>
        Go to build screen →
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 4,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 15,
    marginTop: 12,
    lineHeight: 20,
  },
  listItem: {
    fontSize: 15,
    lineHeight: 20,
  },
  link: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a73e8",
    marginTop: 24,
  },
});
