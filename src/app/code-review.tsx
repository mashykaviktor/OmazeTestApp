/**
 * My Draws
 *
 * Shows the signed-in user (USER_ID) every draw they hold entries for, and lets
 * them add a further entry to a draw of their choosing. Draws and entries are
 * both fetched asynchronously from the fake API above.
 *
 * What the finished screen is meant to show, top to bottom:
 *
 * 1. Summary — three figures side by side: how many entries the user holds, how
 *    many entry codes those add up to, and how many draws are still open to
 *    enter (their endsAt is in the future).
 *
 * 2. Featured — one highlighted draw, shown as an image with its title, a
 *    human-readable type badge ("House", "Early bird" or "Monthly millionaire")
 *    and its closing date.
 *
 * 3. House draws — every draw of type "house", narrowable by title using the
 *    search box, each rendered the same way as the featured draw.
 *
 * 4. Add an entry — a row of chips for choosing a draw, and a button that adds
 *    one new entry to whichever draw is selected. Adding an entry takes effect
 *    straight away: the summary figures and the code list below it both reflect
 *    the new entry without the user having to do anything else. Below that
 *    button is a second, unrelated "Tapped {n}" debug button that just counts
 *    its own presses.
 *
 * 5. Your codes — every entry code the user holds for the selected draw. Each
 *    row is memoised, the intent being that a row only re-renders when the code
 *    it displays changes, not when unrelated state on this screen does.
 *
 * Data comes from src/data/draws.json and src/data/entries.json. The current
 * user is hardcoded as "user_123".
 *
 * Rough layout, top to bottom:
 *
 * ┌─────────────────────────────────────────────┐
 * │  My Draws                                    │
 * │                                               │
 * │  ┌───────────┐ ┌───────────┐ ┌───────────┐   │
 * │  │     4     │ │     9     │ │     3     │   │ 1. Summary
 * │  │  Entries  │ │   Codes   │ │  Active   │   │
 * │  │ across... │ │ across... │ │ still...  │   │
 * │  └───────────┘ └───────────┘ └───────────┘   │
 * │                                               │
 * │  Featured                                    │
 * │  ┌─────────────────────────────────────────┐ │
 * │  │              [ image ]                 │ │ 2. Featured
 * │  ├─────────────────────────────────────────┤ │
 * │  │ Big House Draw            (House)      │ │
 * │  │ Closes 2026-09-01                      │ │
 * │  └─────────────────────────────────────────┘ │
 * │                                               │
 * │  House draws (3)                             │
 * │  ┌─────────────────────────────────────────┐ │
 * │  │ 🔍 Search house draws                  │ │
 * │  └─────────────────────────────────────────┘ │
 * │  ┌─────────────────────────────────────────┐ │
 * │  │              [ image ]                 │ │ 3. House draws
 * │  ├─────────────────────────────────────────┤ │    (repeats per
 * │  │ House Draw A               (House)     │ │     draw)
 * │  │ Closes 2026-08-30                      │ │
 * │  └─────────────────────────────────────────┘ │
 * │                                               │
 * │  Add an entry                                │
 * │  ( Draw A )( Draw B )( Early Bird )( ... )   │ 4. Add an entry
 * │                                               │
 * │  ┌─────────────────────────────────────────┐ │
 * │  │        Add entry to Draw A             │ │
 * │  └─────────────────────────────────────────┘ │
 * │  ┌─────────────────────────────────────────┐ │
 * │  │           Tapped 0                     │ │    debug button,
 * │  └─────────────────────────────────────────┘ │    unrelated to entries
 * │                                               │
 * │  Your codes for Draw A                       │
 * │  ┌─────────────────────────────────────────┐ │
 * │  │ AB12-3456              Draw A          │ │ 5. Your codes
 * │  └─────────────────────────────────────────┘ │
 * │  ┌─────────────────────────────────────────┐ │
 * │  │ CD78-9012              Draw A          │ │
 * │  └─────────────────────────────────────────┘ │
 * └─────────────────────────────────────────────┘
 */
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, ViewStyle } from "react-native";
import drawsData from "@/data/draws.json";
import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import entriesData from "@/data/entries.json";
import { Image } from "expo-image";

const USER_ID = "user_123";
const NETWORK_DELAY_MS = 600;

function withDelay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), NETWORK_DELAY_MS);
  });
}

function fetchDraws(): Promise<any> {
  return withDelay(drawsData);
}

function fetchEntries(userId: string): Promise<any> {
  return withDelay(entriesData.filter((entry) => entry.userId === userId));
}

type EntryRowProps = {
  code: string;
  drawTitle: string;
  style: ViewStyle;
  onPress: () => void;
};

const EntryRow = React.memo(function EntryRow({ code, drawTitle, style, onPress }: EntryRowProps) {
  console.log("EntryRow render:", code);
  return (
    <Pressable style={style} onPress={onPress}>
      <Text style={styles.entryCode}>{code}</Text>
      <Text style={styles.entryDraw}>{drawTitle}</Text>
    </Pressable>
  );
});

export default function CodeReviewScreen() {
  const [draws, setDraws] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [houseDraws, setHouseDraws] = useState<any[]>([]);
  const [selectedDrawId, setSelectedDrawId] = useState("draw_h53");
  const [tapCount, setTapCount] = useState(0);

  const loadEntries = () => fetchEntries(USER_ID).then(setEntries);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    fetchDraws().then(setDraws);
  }, []);

  useEffect(() => {
    setHouseDraws(
      draws
        .filter((draw) => draw.type === "house")
        .filter((draw) => draw.title.toLowerCase().includes(query.toLowerCase()))
    );
  }, [draws, query]);

  const totalCodes = entries.reduce((sum, entry) => sum + entry.codes.length, 0);
  const activeDraws = draws.filter((draw) => new Date(draw.endsAt) > new Date()).length;
  const featuredDraw = draws[0];

  const selectedDraw = draws.find((draw) => draw.id === selectedDrawId);
  const visibleCodes = entries
    .filter((entry) => entry.drawId === selectedDrawId)
    .flatMap((entry) => entry.codes);

  const addEntry = () => {
    const newEntry = {
      id: "entry_local_" + (entries.length + 1),
      drawId: selectedDrawId,
      userId: USER_ID,
      codes: ["NEW-" + (entries.length + 1)],
      enteredAt: new Date().toISOString(),
    };
    entries.push(newEntry);
    setEntries(entries);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: "My Draws" }} />

      {/* ---------- summary ---------- */}
      <Text style={styles.heading}>My Draws</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{entries.length}</Text>
          <Text style={styles.statLabel}>Entries</Text>
          <Text style={styles.statCaption}>across all draws</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalCodes}</Text>
          <Text style={styles.statLabel}>Codes</Text>
          <Text style={styles.statCaption}>across all draws</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{activeDraws}</Text>
          <Text style={styles.statLabel}>Active</Text>
          <Text style={styles.statCaption}>still open to enter</Text>
        </View>
      </View>

      {/* ---------- featured draw ---------- */}
      <Text style={styles.sectionHeading}>Featured</Text>

      <View style={styles.featuredCard}>
        <Image source={featuredDraw.imageUrl} style={styles.featuredImage} contentFit="cover" />
        <View style={styles.featuredBody}>
          <Text style={styles.featuredTitle}>{featuredDraw.title}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {featuredDraw.type === "house"
                ? "House"
                : featuredDraw.type === "early_bird"
                  ? "Early bird"
                  : "Monthly millionaire"}
            </Text>
          </View>
          <Text style={styles.featuredMeta}>Closes {featuredDraw.endsAt.slice(0, 10)}</Text>
        </View>
      </View>

      {/* ---------- house draws ---------- */}
      <Text style={styles.sectionHeading}>House draws ({houseDraws.length})</Text>

      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Search house draws"
      />

      {houseDraws.map((draw) => (
        <View key={draw.id} style={styles.drawCard}>
          <Image source={draw.imageUrl} style={styles.drawImage} contentFit="cover" />
          <View style={styles.drawBody}>
            <Text style={styles.drawTitle}>{draw.title}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {draw.type === "house"
                  ? "House"
                  : draw.type === "early_bird"
                    ? "Early bird"
                    : "Monthly millionaire"}
              </Text>
            </View>
            <Text style={styles.drawMeta}>Closes {draw.endsAt.slice(0, 10)}</Text>
          </View>
        </View>
      ))}

      {/* ---------- add an entry ---------- */}
      <Text style={styles.sectionHeading}>Add an entry</Text>

      <View style={styles.pickerRow}>
        {draws.map((draw) => (
          <Pressable
            key={draw.id}
            onPress={() => setSelectedDrawId(draw.id)}
            style={draw.id === selectedDrawId ? styles.pickerChipActive : styles.pickerChip}
          >
            <Text style={styles.pickerChipText}>{draw.title}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.button} onPress={addEntry}>
        <Text style={styles.buttonText}>Add entry to {selectedDraw.title}</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={() => setTapCount(tapCount + 1)}>
        <Text style={styles.buttonText}>Tapped {tapCount}</Text>
      </Pressable>

      {/* ---------- entry codes ---------- */}
      <Text style={styles.sectionHeading}>Your codes for {selectedDraw.title}</Text>

      {visibleCodes.map((code, index) => (
        <EntryRow
          key={index}
          code={code}
          drawTitle={selectedDraw.title}
          style={{ padding: 12, backgroundColor: "#f4f4f5", borderRadius: 8 }}
          onPress={() => setTapCount(tapCount + 1)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 10 },
  heading: { fontSize: 24, fontWeight: "700" },
  sectionHeading: { fontSize: 17, fontWeight: "600", marginTop: 20 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: "#f4f4f5" },
  statValue: { fontSize: 22, fontWeight: "700" },
  statLabel: { fontSize: 13, fontWeight: "600" },
  statCaption: { fontSize: 11, color: "#71717a" },
  featuredCard: { borderRadius: 12, overflow: "hidden", backgroundColor: "#fafafa" },
  featuredImage: { width: "100%", height: 180 },
  featuredBody: { padding: 12, gap: 6 },
  featuredTitle: { fontSize: 18, fontWeight: "700" },
  featuredMeta: { fontSize: 12, color: "#71717a" },
  drawCard: { borderRadius: 12, overflow: "hidden", backgroundColor: "#fafafa" },
  drawImage: { width: "100%", height: 140 },
  drawBody: { padding: 12, gap: 6 },
  drawTitle: { fontSize: 16, fontWeight: "700" },
  drawMeta: { fontSize: 12, color: "#71717a" },
  badge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: "#e4e4e7" },
  badgeText: { fontSize: 11, fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#d4d4d8", borderRadius: 8, padding: 10 },
  pickerRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pickerChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#f4f4f5" },
  pickerChipActive: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#bfdbfe" },
  pickerChipText: { fontSize: 12 },
  button: { padding: 12, borderRadius: 8, backgroundColor: "#1a73e8", alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
  entryCode: { fontSize: 15, fontWeight: "600" },
  entryDraw: { fontSize: 12, color: "#71717a" },
});
