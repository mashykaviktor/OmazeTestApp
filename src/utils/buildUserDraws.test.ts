import { buildUserDraws } from "./buildUserDraws";
import type { Draw, Entry } from "@/types/draws";

const NOW = new Date("2026-01-01T00:00:00Z");

const draws: Draw[] = [
  {
    id: "draw_active_soon",
    title: "Closes soon",
    type: "house",
    imageUrl: "https://example.com/a.jpg",
    endsAt: "2026-01-10T00:00:00Z",
  },
  {
    id: "draw_active_later",
    title: "Closes later",
    type: "house",
    imageUrl: "https://example.com/b.jpg",
    endsAt: "2026-02-01T00:00:00Z",
  },
  {
    id: "draw_past_recent",
    title: "Ended recently",
    type: "early_bird",
    imageUrl: "https://example.com/c.jpg",
    endsAt: "2025-12-20T00:00:00Z",
  },
  {
    id: "draw_past_older",
    title: "Ended long ago",
    type: "monthly_millionaire",
    imageUrl: "https://example.com/d.jpg",
    endsAt: "2025-11-01T00:00:00Z",
  },
  {
    id: "draw_no_entries",
    title: "User never entered",
    type: "house",
    imageUrl: "https://example.com/e.jpg",
    endsAt: "2026-03-01T00:00:00Z",
  },
];

const entries: Entry[] = [
  { id: "e1", drawId: "draw_active_soon", userId: "user_123", codes: ["A-1", "A-2"], enteredAt: "2025-12-01T00:00:00Z" },
  { id: "e2", drawId: "draw_active_soon", userId: "user_123", codes: ["A-3"], enteredAt: "2025-12-02T00:00:00Z" },
  { id: "e3", drawId: "draw_active_later", userId: "user_123", codes: ["B-1"], enteredAt: "2025-12-03T00:00:00Z" },
  { id: "e4", drawId: "draw_past_recent", userId: "user_123", codes: ["C-1"], enteredAt: "2025-11-01T00:00:00Z" },
  { id: "e5", drawId: "draw_past_older", userId: "user_123", codes: ["D-1"], enteredAt: "2025-10-01T00:00:00Z" },
  // belongs to a different user - must be excluded
  { id: "e6", drawId: "draw_active_soon", userId: "user_456", codes: ["Z-1"], enteredAt: "2025-12-01T00:00:00Z" },
];

test("includes only draws the user holds entries for", () => {
  const result = buildUserDraws(draws, entries, "user_123", NOW);

  const ids = result.map((item) => item.draw.id);
  expect(ids).not.toContain("draw_no_entries");
  expect(ids).toHaveLength(4);
});

test("aggregates all of a user's codes for a draw across multiple entries", () => {
  const result = buildUserDraws(draws, entries, "user_123", NOW);

  const activeSoon = result.find((item) => item.draw.id === "draw_active_soon")!;
  expect(activeSoon.codes).toEqual(["A-1", "A-2", "A-3"]);
  expect(activeSoon.totalCodes).toBe(3);
});

test("marks draws as active or past relative to now", () => {
  const result = buildUserDraws(draws, entries, "user_123", NOW);

  const activeSoon = result.find((item) => item.draw.id === "draw_active_soon")!;
  const pastRecent = result.find((item) => item.draw.id === "draw_past_recent")!;
  expect(activeSoon.isActive).toBe(true);
  expect(pastRecent.isActive).toBe(false);
});

test("orders active draws before past draws, soonest-closing first then most-recently-ended first", () => {
  const result = buildUserDraws(draws, entries, "user_123", NOW);

  expect(result.map((item) => item.draw.id)).toEqual([
    "draw_active_soon",
    "draw_active_later",
    "draw_past_recent",
    "draw_past_older",
  ]);
});
