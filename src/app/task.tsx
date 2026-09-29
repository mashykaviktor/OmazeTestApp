import React, { useMemo } from "react";
import { FlatList, Text, View } from "react-native";
import { Image } from "expo-image";

import drawsData from "@/data/draws.json";
import entriesData from "@/data/entries.json";
import { buildUserDraws } from "@/utils/buildUserDraws";
import type { Draw, DrawType, Entry, UserDraw } from "@/types/draws";
import { styles } from "@/styles/task.styles";

const USER_ID = "user_123";

const draws = drawsData as Draw[];
const entries = entriesData as Entry[];

const DRAW_TYPE_LABELS: Record<DrawType, string> = {
  house: "House",
  early_bird: "Early bird",
  monthly_millionaire: "Monthly millionaire",
};

const DrawEntryCard = React.memo(function DrawEntryCard({
  item,
}: {
  item: UserDraw;
}) {
  const { draw, isActive, codes, totalCodes } = item;

  return (
    <View style={styles.card}>
      <Image source={draw.imageUrl} style={styles.image} contentFit="cover" />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{draw.title}</Text>
          <View
            style={[
              styles.statusBadge,
              isActive ? styles.statusActive : styles.statusPast,
            ]}
          >
            <Text style={styles.statusText}>
              {isActive ? "Active" : "Past"}
            </Text>
          </View>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{DRAW_TYPE_LABELS[draw.type]}</Text>
        </View>

        <Text style={styles.meta}>Closes {draw.endsAt.slice(0, 10)}</Text>

        <Text style={styles.codesHeading}>
          {totalCodes} {totalCodes === 1 ? "code" : "codes"}
        </Text>
        <View style={styles.codesList}>
          {codes.map((code) => (
            <View key={code} style={styles.codeChip}>
              <Text style={styles.codeText}>{code}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
});

export default function Task() {
  const userDraws = useMemo(
    () => buildUserDraws(draws, entries, USER_ID, new Date()),
    [],
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={userDraws}
      keyExtractor={(item) => item.draw.id}
      renderItem={({ item }) => <DrawEntryCard item={item} />}
      ListHeaderComponent={<Text style={styles.heading}>My Draws</Text>}
      ListEmptyComponent={
        <Text style={styles.empty}>
          You haven&apos;t entered any draws yet.
        </Text>
      }
    />
  );
}
