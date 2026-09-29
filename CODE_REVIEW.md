# Code Review — `src/app/code-review.tsx`

The header comment in `code-review.tsx` specifies the intended behavior of the
"My Draws" screen: summary stats, a featured draw, a searchable list of house
draws, an "add entry" flow that updates the UI immediately, and a list of
entry codes where each row is memoised so it only re-renders when the code it
displays changes.

The implementation below the comment does not match that spec in several
places. Findings are ordered by severity.

## Critical

### 1. Infinite fetch loop via an unstable `loadEntries` reference
**Lines 133–137**
```ts
const loadEntries = () => fetchEntries(USER_ID).then(setEntries);
useEffect(() => { loadEntries(); }, [loadEntries]);
```
`loadEntries` is a new function literal on every render. `useEffect` sees the
dependency change on every render and re-runs, which calls `fetchEntries`
(600ms delay) → `setEntries` → re-render → new `loadEntries` reference →
effect fires again. This is an unbounded loop of network calls for as long as
the screen is mounted, not a one-time fetch on mount.

**Fix:** drop the intermediate function and give the effect an empty
dependency array, or wrap `loadEntries` in `useCallback` with no dependencies.

### 2. Crash on first render — `featuredDraw` / `selectedDraw` can be `undefined`
**Lines 153, 155, 201, 262, 270**

`draws` starts as `[]` and is populated asynchronously after a 600ms delay.
Before that resolves:
- `featuredDraw = draws[0]` is `undefined`, and
  `<Image source={featuredDraw.imageUrl} .../>` throws.
- `selectedDraw = draws.find(...)` is `undefined`, and
  `Add entry to {selectedDraw.title}` / `Your codes for {selectedDraw.title}`
  throw as well.

The screen crashes on mount, before the initial fetch ever completes.

**Fix:** render a loading state (or `return null`) while `draws.length === 0`,
or guard every read of `featuredDraw` / `selectedDraw` with an
undefined check.

### 3. Direct state mutation — "Add entry" doesn't update the UI
**Lines 160–170**
```ts
const addEntry = () => {
  const newEntry = { ... };
  entries.push(newEntry);
  setEntries(entries);
};
```
`entries.push` mutates the array in place, then `setEntries(entries)` is
called with the *same reference* already held in state. React bails out of
re-rendering when the new state is `Object.is`-equal to the previous state —
so pressing "Add entry to X" has no visible effect, even though the
underlying array did gain an item.

**Fix:** `setEntries([...entries, newEntry])`.

## High

### 4. `houseDraws` is a redundant `useEffect` + `useState` instead of a derived value
**Lines 129, 143–149**

Filtering by search query lives in its own state, synced via an effect,
instead of being computed inline or via `useMemo`. This doubles the number of
renders on every `draws`/`query` change (one render with the stale
`houseDraws`, then a second once the effect updates it), causing visible lag
while typing in the search box. This is also what ESLint's
`react-hooks/set-state-in-effect` rule flags as an **error** on line 144 —
`npx expo lint` currently fails because of it.

### 5. `React.memo` on `EntryRow` doesn't actually prevent re-renders
**Lines 115–123, 272–280**

The header comment explicitly states each row "only re-renders when the code
it displays changes, not when unrelated state on this screen does." But:
```tsx
<EntryRow
  key={index}
  style={{ padding: 12, ... }}
  onPress={() => setTapCount(tapCount + 1)}
/>
```
`style` and `onPress` are new object/function literals on every parent
render, so `React.memo`'s shallow prop comparison always fails and every row
re-renders anyway. Pressing the unrelated "Tapped" button (which also touches
`tapCount`) re-renders every `EntryRow` — the opposite of the stated intent.

**Fix:** memoise the style object outside the render (or via `useMemo`), and
wrap `onPress` in `useCallback`.

### 6. `key={index}` instead of `key={code}`
**Line 274**

`code` is already a unique, stable string per draw and would make a correct
React key. Using the array index breaks reconciliation identity when the list
changes order or gains items (e.g. after `addEntry`), and combined with
finding #5, can leave a row showing a stale code after the list changes.

## Medium

### 7. Entry-code taps and the debug button share the same `tapCount` state
**Lines 131, 265–267, 278**

The header comment describes the debug button as counting "its own presses,"
implying it's unrelated to anything else on the screen. But tapping an
`EntryRow` (line 278) also increments the same `tapCount` used by the
"Tapped {n}" button — silently conflating two states the comment describes as
independent.

### 8. `any[]` types instead of `Draw` / `Entry`
**Lines 100–106, 126–129**

`fetchDraws(): Promise<any>`, and `draws`/`entries`/`houseDraws` are all
typed `any[]`. Nothing here catches a typo like `draw.tyype`. The project
already defines `Draw` and `Entry` in `src/types/draws.ts` — this file should
use them.

### 9. Duplicated draw-type label logic
**Lines 206–211, 234–239**

The same three-way ternary (`type === "house" ? "House" : ...`) is repeated
for the featured draw and for each house draw card. `task.tsx` already
defines a `DRAW_TYPE_LABELS: Record<DrawType, string>` lookup that could be
shared here instead.

## Minor

### 10. Fragile id generation for new entries
**Line 162**

`"entry_local_" + (entries.length + 1)` can collide on rapid successive taps
before state settles (especially combined with bug #3, where state may not
update between clicks at all). Prefer `crypto.randomUUID()` or a counter kept
outside render.

## Summary

| # | Severity | Issue |
|---|----------|-------|
| 1 | Critical | Unbounded re-fetch loop (`loadEntries` identity) |
| 2 | Critical | Crash on mount before first fetch resolves |
| 3 | Critical | State mutation silently breaks "Add entry" |
| 4 | High | Derived value modeled as effect + state |
| 5 | High | `React.memo` defeated by inline props |
| 6 | High | Index used as list key |
| 7 | Medium | Unrelated state accidentally shared |
| 8 | Medium | Missing types (`any[]`) |
| 9 | Medium | Duplicated label logic |
| 10 | Minor | Non-unique id generation |

Findings #1–#3 are functional bugs, not style issues: the screen loops
network calls indefinitely, crashes before data loads, and the primary
"add entry" action silently does nothing.
