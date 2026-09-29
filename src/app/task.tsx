import { StyleSheet, Text, View } from "react-native";

import drawsData from "@/data/draws.json";
import entriesData from "@/data/entries.json";

type DrawType = "house" | "early_bird" | "monthly_millionaire";

type Draw = {
  id: string;
  title: string;
  type: DrawType;
  imageUrl: string;
  endsAt: string;
};

type Entry = {
  id: string;
  drawId: string;
  userId: string;
  codes: string[];
  enteredAt: string;
};

const userId = "user_123";
const draws = drawsData as Draw[];
const entries = entriesData as Entry[];

export default function Task() {
  return (
    <View style={styles.container}>
      <Text>Edit src/app/task.tsx to build the draws screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
